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
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#FFE6F4', padding: 24 }}>
        <Container style={{ background: '#FFFFFF', border: '2px solid #FFCDE8', borderRadius: 18, padding: 24, maxWidth: 480, boxShadow: '3px 3px 0 #FFB6E6' }}>
          <Heading style={{ margin: 0, fontSize: 20, color: '#5B3A8A' }}>{`${toName},${fromName} 给你扣了 ${points} 分`}</Heading>
          <Section style={{ marginTop: 16 }}>
            <Text style={{ margin: 0, color: '#B891D1', fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700 }}>原因</Text>
            <Text style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 700, color: '#5B3A8A' }}>{reason}</Text>
          </Section>
          <Section style={{ marginTop: 16, padding: 14, background: '#FFEDF6', borderRadius: 14, border: '1.5px solid #FFCDE8' }}>
            <Text style={{ margin: 0, color: '#B891D1', fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700 }}>你今日剩余</Text>
            <Text style={{ margin: '4px 0 0', fontSize: 36, color: '#FF4F8F', fontWeight: 900 }}>{`${remaining}/100`}</Text>
          </Section>
          {nudge && (
            <Section style={{ marginTop: 14, padding: 12, background: '#FFF0E6', borderLeft: '4px solid #FF6FB5', borderRadius: 8 }}>
              <Text style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#5B3A8A' }}>{nudge}</Text>
            </Section>
          )}
          <Button href={appUrl} style={{ marginTop: 20, background: '#FF6FB5', color: '#FFFFFF', padding: '12px 18px', borderRadius: 14, border: '2px solid #FFFFFF', boxShadow: '3px 3px 0 #FFB6E6', fontWeight: 800, textDecoration: 'none', display: 'inline-block' }}>查看明细 →</Button>
        </Container>
      </Body>
    </Html>
  );
}
