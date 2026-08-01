export const Colors = {
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

export function getHexColor(colorName: keyof typeof Colors): number {
  return Colors[colorName] || Colors.Default;
}
