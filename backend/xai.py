# Dual XAI: Captum's LayerGradCam (region-level) + IntegratedGradients (pixel-level).
# Target layer for Grad-CAM is the last Bottleneck block of stage 4
# (model.layer4[-1]) -- valid because model.py subclasses torchvision's ResNet
# directly with standard layer naming, not a custom module hierarchy.

import io
import base64

import numpy as np
import torch
from PIL import Image
from captum.attr import LayerGradCam, IntegratedGradients

IMAGENET_MEAN = torch.tensor([0.485, 0.456, 0.406]).view(3, 1, 1)
IMAGENET_STD = torch.tensor([0.229, 0.224, 0.225]).view(3, 1, 1)


def _denormalize_to_uint8(tensor_chw):
    img = tensor_chw.detach().cpu() * IMAGENET_STD + IMAGENET_MEAN
    img = img.clamp(0, 1).permute(1, 2, 0).numpy()
    return (img * 255).astype(np.uint8)


def _to_base64_png(np_uint8_rgb):
    buf = io.BytesIO()
    Image.fromarray(np_uint8_rgb).save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("ascii")


def _jet_colormap(heatmap_2d):
    """heatmap_2d: float array in [0,1]. Hand-rolled jet-style colormap
    (avoids adding matplotlib as a dependency just for this)."""
    h = heatmap_2d
    r = np.clip(1.5 - np.abs(4 * h - 3), 0, 1)
    g = np.clip(1.5 - np.abs(4 * h - 2), 0, 1)
    b = np.clip(1.5 - np.abs(4 * h - 1), 0, 1)
    return (np.stack([r, g, b], axis=-1) * 255).astype(np.uint8)


def _resize_map(map_2d, size):
    img = Image.fromarray((map_2d * 255).astype(np.uint8))
    img = img.resize(size, Image.BILINEAR)
    return np.array(img) / 255.0


def _overlay(base_uint8_rgb, heatmap_2d, alpha=0.45):
    colored = _jet_colormap(heatmap_2d)
    overlay = base_uint8_rgb.astype(np.float32) * (1 - alpha) + colored.astype(np.float32) * alpha
    return overlay.clip(0, 255).astype(np.uint8), colored


def generate_gradcam(model, input_tensor, target_class):
    gradcam = LayerGradCam(model, model.layer4[-1])
    attributions = gradcam.attribute(input_tensor, target=target_class, relu_attributions=True)
    cam = attributions[0, 0].detach().cpu().numpy()
    if cam.max() > 0:
        cam = cam / cam.max()

    h, w = input_tensor.shape[2], input_tensor.shape[3]
    cam_resized = _resize_map(cam, (w, h))

    base_img = _denormalize_to_uint8(input_tensor[0])
    overlay, heatmap_only = _overlay(base_img, cam_resized, alpha=0.45)

    return {
        "overlay_png": _to_base64_png(overlay),
        "heatmap_png": _to_base64_png(heatmap_only),
    }


def generate_integrated_gradients(model, input_tensor, target_class, n_steps=50, internal_batch_size=5):
    # internal_batch_size chunks the n_steps internally instead of running
    # all of them as one batched forward/backward pass -- without this,
    # Captum replicates the input n_steps times in a single batch, which
    # spikes peak memory (n_steps=50 copies of activations through all 54
    # conv layers) badly enough to segfault on memory-constrained machines.
    ig = IntegratedGradients(model)
    baseline = torch.zeros_like(input_tensor)
    attributions = ig.attribute(
        input_tensor, baseline, target=target_class,
        n_steps=n_steps, internal_batch_size=internal_batch_size,
    )

    attr = attributions[0].detach().cpu().numpy()  # (3, H, W)
    attr = np.abs(attr).sum(axis=0)  # (H, W)
    if attr.max() > 0:
        attr = attr / attr.max()

    base_img = _denormalize_to_uint8(input_tensor[0])
    overlay, attribution_only = _overlay(base_img, attr, alpha=0.5)

    return {
        "overlay_png": _to_base64_png(overlay),
        "attribution_png": _to_base64_png(attribution_only),
    }
