import type { StorybookConfig } from '@storybook/react-webpack5';

// Add the webpackFinal configuration to customize the Webpack setup
const webpackFinal = async (config) => {
  // Add a new rule for TypeScript files
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    use: [
      {
        loader: require.resolve('babel-loader'),
        options: {
          presets: [
            // Add the TypeScript preset
            require.resolve('@babel/preset-typescript'),
            // Add the React preset, if not already present
            [require.resolve('@babel/preset-react'), { runtime: 'automatic' }],
          ],
        },
      },
    ],
  });

  // Return the altered config
  return config;
};

const storybookConfig: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    // '@storybook/preset-create-react-app', // Commented out to fix webpack manifest plugin issue
    '@storybook/addon-onboarding',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  staticDirs: ['../public'],
  webpackFinal, // Add the webpackFinal function to the Storybook configuration
};

export default storybookConfig;
