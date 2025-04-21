// tags.stories.js
import React from 'react';
import { Tags } from './tags';

export default {
  title: 'Components/Tags',
  component: Tags,
};

const Template = (args) => <Tags {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const WithPredefinedTags = Template.bind({});
WithPredefinedTags.args = {
  // You may modify the Tags component to accept initial tags as a prop if needed
};
