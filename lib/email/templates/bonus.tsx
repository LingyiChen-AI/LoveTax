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
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#E0F4FF', padding: 24 }}>
        <Container style={{ background: '#fff', border: '2.5px solid #5B3A8A', borderRadius: 14, padding: 20, maxWidth: 480 }}>
          <Heading style={{ margin: 0, fontSize: 20, color: '#5B3A8A' }}>{`${toName},${fromName} 夸了你 +${points} 分 ✨`}</Heading>
          <Section style={{ marginTop: 14 }}>
            <Text style={{ margin: 0, color: '#B891D1', fontSize: 13 }}>原因</Text>
            <Text style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 700 }}>{reason}</Text>
          </Section>
          <Section style={{ marginTop: 14, padding: 12, background: '#E0F4FF', borderRadius: 10 }}>
            <Text style={{ margin: 0, color: '#B891D1', fontSize: 13 }}>你今日剩余</Text>
            <Text style={{ margin: '4px 0 0', fontSize: 32, color: '#6FB8FF', fontWeight: 800 }}>{`${remaining}/100`}</Text>
          </Section>
          <Button href={appUrl} style={{ marginTop: 18, background: '#6FB8FF', color: '#FFFFFF', padding: '12px 16px', borderRadius: 12, border: '2.5px solid #5B3A8A', fontWeight: 800, textDecoration: 'none', display: 'inline-block' }}>查看明细</Button>
        </Container>
      </Body>
    </Html>
  );
}
