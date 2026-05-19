import { Html, Head, Body, Container, Heading, Text, Section, Button } from '@react-email/components';

export interface BonusProps {
  appUrl: string;
  fromName: string;
  toName: string;
  points: number;
  reason: string;
  remaining: number;
}

export default function Bonus({ appUrl, fromName, toName, points, reason, remaining }: BonusProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: '-apple-system, system-ui, sans-serif', backgroundColor: '#FFFFFF', padding: 24, margin: 0 }}>
        <Container style={{ background: '#FFFFFF', borderRadius: 16, padding: 4, maxWidth: 480 }}>
          <Heading style={{ margin: 0, fontSize: 20, color: '#1C1C1E', fontWeight: 600 }}>{`${toName},${fromName} 夸了你 +${points} 分`}</Heading>
          <Section style={{ marginTop: 16, padding: 14, background: '#F2F2F7', borderRadius: 14 }}>
            <Text style={{ margin: 0, color: '#8E8E93', fontSize: 12, fontWeight: 500 }}>原因</Text>
            <Text style={{ margin: '4px 0 0', fontSize: 15, fontWeight: 500, color: '#1C1C1E' }}>{reason}</Text>
          </Section>
          <Section style={{ marginTop: 12, padding: 14, background: '#F2F2F7', borderRadius: 14 }}>
            <Text style={{ margin: 0, color: '#8E8E93', fontSize: 12, fontWeight: 500 }}>你今日剩余</Text>
            <Text style={{ margin: '4px 0 0', fontSize: 32, color: '#34C759', fontWeight: 700, letterSpacing: -0.5 }}>{`${remaining}/100`}</Text>
          </Section>
          <Button href={appUrl} style={{ marginTop: 18, background: '#34C759', color: '#FFFFFF', padding: '12px 20px', borderRadius: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>查看明细</Button>
        </Container>
      </Body>
    </Html>
  );
}
