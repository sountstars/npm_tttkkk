require("@babel/register")({
  babelrc: false,
  presets: ["@babel/preset-env"],
  plugins: ["@babel/plugin-syntax-dynamic-import"],
});

require("../src/index");
