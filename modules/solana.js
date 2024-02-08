import { parseArgs } from "node:util";

const parseArgsSolana = () => {
  const options = {
    network: {
      type: "string",
    },
  };

  const { values } = parseArgs({
    args: process.args,
    options,
  });

  return values;
};

export { parseArgsSolana };
