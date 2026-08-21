import type { Metadata } from 'next';
import { OnboardingPortal } from '@/components/onboarding/OnboardingPortal';

export const metadata: Metadata = {
  title: 'Central do projeto',
  description: 'Envie informações, textos e imagens para a personalização do seu projeto Blajeen.',
  robots: { index: false, follow: false, noarchive: true },
};

export default async function OnboardingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <OnboardingPortal token={token} />;
}

