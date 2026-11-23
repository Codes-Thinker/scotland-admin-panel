import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

// eslint-config-next 16 ships flat configs, so no compatibility layer is needed.
const eslintConfig = [...coreWebVitals, ...typescript];

export default eslintConfig;
