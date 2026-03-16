const modules = import.meta.glob("../../apps/*/index.jsx", { eager: true });

export function discoverApps() {
  return Object.entries(modules)
    .map(([path, module]) => {
      const matched = path.match(/apps\/([^/]+)\/index\.jsx$/);
      const slug = matched?.[1];

      if (!slug || !module.meta || !module.default) {
        return null;
      }

      return {
        slug,
        Component: module.default,
        order: module.meta.order ?? Number.MAX_SAFE_INTEGER,
        ...module.meta
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.order - right.order || left.name.localeCompare(right.name, "vi"));
}
