module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // We want to find all JSX elements that contain {data.address} and transform them.
  // This is a bit tricky, but we can look for any JSXElement that contains an expression {data.address}
  // Actually, we can just replace the whole JSX tree that represents the contact block.
  // Because they are all slightly different, maybe it's easier to just do text replacement?
  
  return root.toSource();
};
