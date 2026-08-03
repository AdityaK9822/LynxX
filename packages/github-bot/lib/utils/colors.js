"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Colors = void 0;
exports.getHexColor = getHexColor;
exports.Colors = {
    Opened: 0x2ecc71,
    Assigned: 0x3498db,
    ReviewRequested: 0xf1c40f,
    Approved: 0x9b59b6,
    ChangesRequested: 0xe67e22,
    Closed: 0xe74c3c,
    Merged: 0x2ecc71,
    Default: 0x95a5a6,
    FirstContribution: 0xf1c40f,
};
function getHexColor(colorName) {
    return exports.Colors[colorName] || exports.Colors.Default;
}
