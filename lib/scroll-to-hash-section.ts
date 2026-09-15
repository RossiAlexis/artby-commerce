export function scrollToHashSection(hash: string) {
  const target = document.getElementById(hash);
  if (!target) return;

  target.scrollIntoView({ block: "start" });
  window.history.replaceState(null, "", `#${hash}`);
}
