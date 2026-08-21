import React from 'react';
import RainbowPipelineDiagram from '../components/RainbowPipelineDiagram';

export default function About({ navigate }) {
  return (
    <div className="about-page">
      <header className="page-header-banner">
        <div className="banner-left">
          <span className="rainbow-kicker">ℹ️ ABOUT ASL BRIDGE</span>
          <h2>AI Continuous ASL Sign & Voice Engine</h2>
          <p>An end-to-end accessibility platform translating natural spoken and written English into continuous 3D cartoon avatar sign language sequences.</p>
        </div>
      </header>

      <RainbowPipelineDiagram activeStep="all" />

      <section className="about-details-card">
        <h3>Architecture & Design Philosophy</h3>
        <p>
          Unlike legacy systems that require pre-recording every single sentence as isolated video files, ASL Bridge breaks down language into structured linguistic units, generating forward kinematics, 5-finger articulation, and Hermite spline coarticulation blending dynamically on 3D cartoon avatars.
        </p>
      </section>
    </div>
  );
}
