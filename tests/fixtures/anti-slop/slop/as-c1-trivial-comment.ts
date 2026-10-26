export function displayName(user: { name: string }): string {
  // Get the user name
  const userName = user.name.trim();
  return userName;
}
