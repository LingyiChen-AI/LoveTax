import { Html, Head, Body, Container, Heading, Text, Section, Button } from '@react-email/components';

export interface DeductionProps {
  appUrl: string;
  fromName: string;
  toName: string;
  points: number;
  reason: string;
  remaining: number;
  nudge?: string | null;
}

export default function Deduction({ appUrl, fromName, toName, points, reason, remaining, nudge }: DeductionProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#FEF3C7', padding: 24 }}>
        <Container style={{ background: '#fff', border: '2.5px solid #1F2937', borderRadius: 14, padding: 20, maxWidth: 480 }}>
          <Heading style={{ margin: 0, fontSize: 20, color: '#1F2937' }}>{toName},{fromName} 给你扣了 {points} 分</Heading>
          <Section style={{ marginTop: 14 }}>
            <Text style={{ margin: 0, color: '#6B7280', fontSize: 13 }}>原因</Text>
            <Text style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 700 }}>{reason}</Text>
          </Section>
          <Section style={{ marginTop: 14, padding: 12, background: '#FEF3C7', borderRadius: 10 }}>
            <Text style={{ margin: 0, color: '#6B7280', fontSize: 13 }}>你今日剩余</Text>
            <Text style={{ margin: '4px 0 0', fontSize: 32, color: '#DC2626', fontWeight: 800 }}>{`${remaining}/100`}</Text>
          </Section>
          {nudge && (
            <Section style={{ marginTop: 14, padding: 12, background: '#FFF7E0', borderLeft: '4px solid #DC2626', borderRadius: 8 }}>
              <Text style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1F2937' }}>{nudge}</Text>
            </Section>
          )}
          <Button href={appUrl} style={{ marginTop: 18, background: '#FBBF24', color: '#1F2937', padding: '12px 16px', borderRadius: 12, border: '2.5px solid #1F2937', fontWeight: 800, textDecoration: 'none', display: 'inline-block' }}>查看明细</Button>
        </Container>
      </Body>
    </Html>
  );
}
