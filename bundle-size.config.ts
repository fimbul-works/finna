const mainBundles = ["bundles/*.js"];

export default {
  groups: [
    {
      name: "Bundles",
      include: mainBundles,
    },
  ],
  minify: true,
};
