# Matches the val/test-time transform pipeline exactly (val_tfms) from the
# training notebook -- no augmentation, since this runs at inference time.
#
# NOTE: the notebook's full pipeline crops the nodule ROI from a bounding box
# (Pascal VOC XML annotation) *before* this resize/normalize step. There is no
# trained detector to produce that bounding box for an arbitrary uploaded
# image, so this demo is scoped to accept already-cropped nodule images
# (e.g. from TN5000_crops/test) -- see plan notes. Do not add a "smart crop"
# here without an actual localization model behind it.

from torchvision import transforms
from PIL import Image

IMG_SIZE = 224

inference_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


def preprocess_image(file_stream):
    """file_stream: a file-like object (e.g. Flask's request.files['image'].stream)."""
    image = Image.open(file_stream).convert("RGB")
    tensor = inference_transform(image)
    return tensor.unsqueeze(0)  # add batch dimension
