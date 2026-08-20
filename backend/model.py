# Ported verbatim (architecture-wise) from the team's training notebook
# (Final_ResNet_Config_Project.ipynb, "RESNET-54 REGULARIZED MODEL TRAINING" section).
# This must stay structurally identical to what produced
# resnet54_v2_REGULARIZED_acc0.9182.pth, or load_state_dict(strict=True) will fail.

import torch.nn as nn
from torchvision.models.resnet import ResNet, Bottleneck


class CustomResNetWithDropout(ResNet):
    def __init__(self, layers, num_classes=2, dropout_p=0.4, pretrained=False):
        super().__init__(block=Bottleneck, layers=layers, num_classes=1000)

        if pretrained:
            import torch
            state_dict = torch.hub.load_state_dict_from_url(
                'https://download.pytorch.org/models/resnet50-0676ba61.pth',
                progress=True
            )
            del state_dict['fc.weight']
            del state_dict['fc.bias']
            self.load_state_dict(state_dict, strict=False)

        # Matches training: fc is Sequential(Dropout, Linear), so checkpoint
        # keys are fc.1.weight / fc.1.bias, not fc.weight / fc.bias.
        num_features = self.fc.in_features
        self.fc = nn.Sequential(
            nn.Dropout(p=dropout_p),
            nn.Linear(num_features, num_classes)
        )


def resnet54_v2_regularized(num_classes=2, dropout_p=0.4, pretrained=False):
    """Bottleneck config [3,5,6,3] -- the configuration used for the paper's
    reported 91.82% validation accuracy / resnet54_v2_REGULARIZED_acc0.9182.pth."""
    return CustomResNetWithDropout([3, 5, 6, 3], num_classes, dropout_p, pretrained)


# 0 = Benign, 1 = Malignant (confirmed against UltrasoundDataset's label_map
# and the paper's "Class 0(Benign) or Class 1(Malignant)" convention).
CLASS_NAMES = ["Benign", "Malignant"]
