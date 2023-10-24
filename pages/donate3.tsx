import React from 'react';
import { Layout } from '../components/Layout';
import { SectionHero } from '../sections/SectionHero'
import { SectionClient } from '../sections/SectionClient'
import { SectionFeacture } from "../sections/SectionFeatrues";
import { SectionPartner } from "../sections/SectionPartner";


export default function Donate3Page() {
  return (
    <Layout bgColor='#ffffff' style={{ maxWidth: '100%' }}>
      <SectionHero />
      <SectionClient />
      <SectionFeacture />
      <SectionPartner />
    </Layout>
  );
}
