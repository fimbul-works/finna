const mainBundles = ["bundles/bundle.js"];

export default {
  groups: [
    {
      name: "Bundles",
      include: mainBundles,
    },
  ],
  minify: true,
};
