import React from 'react';
import Layout from '@theme/Layout';
import {BRAND_NAME} from '@site/src/constants/brandConstants';
import VideoLibrary from '@site/src/components/VideoLibrary';

export default function VideosPage() {
  return (
    <Layout
      title="Videos"
      description={`Short explainers and console walkthroughs for the ${BRAND_NAME} platform, each linked to the docs that cover the feature.`}>
      <VideoLibrary />
    </Layout>
  );
}
