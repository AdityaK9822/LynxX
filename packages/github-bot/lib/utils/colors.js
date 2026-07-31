"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Colors = void 0;
exports.getHexColor = getHexColor;
exports.Colors = {
    Opened: 0x2ecc71, // Green
    Assigned: 0x3498db, // Blue
    ReviewRequested: 0xf1c40f, // Yellow
    Approved: 0x9b59b6, // Purple
    ChangesRequested: 0xe67e22, // Orange
    Closed: 0xe74c3c, // Red
    Merged: 0x2ecc71, // Green (Usually merged is purple in github, but requirements say green check for merged? Wait: "✅ Merged", let's use a distinct green or purple). We'll use 0x8250df for merged like GitHub.
    Default: 0x95a5a6, // Gray
};
function getHexColor(colorName) {
    return exports.Colors[colorName] || exports.Colors.Default;
}
