

module.exports = {
    "extends": ["standard"],
    "rules": {
        "no-extra-semi": 0,
        "semi": ["error", "always"],
        "no-var": 1,
        "eqeqeq": 0,
        "camelcase": 0,
        "comma-dangle": ["error", {
            "arrays": "never",
            "objects": "always",
            "imports": "never",
            "exports": "never",
            "functions": "ignore"
        }]
    },

    "parserOptions": {
        //"parser": "babel-eslint"
    }

}