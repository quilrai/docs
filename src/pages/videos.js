import React from 'react';
import Layout from '@theme/Layout';
import VideoLibrary from '@site/src/components/VideoLibrary';

export default function VideosPage() {
  return (
    <Layout
      title="Videos"
      description="Short explainers and console walkthroughs for the QuilrAI platform, each linked to the docs that cover the feature.">
      <VideoLibrary />
    </Layout>
  );
}
