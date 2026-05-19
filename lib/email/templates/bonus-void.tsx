import { Html, Head, Body, Container, Heading, Text, Section, Button } from '@react-email/components';

export interface BonusVoidProps {
  appUrl: string;
  fromName: string;
  toName: string;
  points: number;
  reason: string;
  remaining: number;
}

export default function BonusVoid({ appUrl, fromName, toName, points, reason, remaining }: BonusVoidProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#E8F4FF', padding: 24 }}>
        <Container style={{ background: '#FFFFFF', border: '2px solid #B4DCFF', borderRadius: 18, padding: 24, maxWidth: 480, boxShadow: '3px 3px 0 #B4DCFF' }}>
          <Heading style={{ margin: 0, fontSize: 20, color: '#5B3A8A' }}>{`${toName},${fromName} 撤销了一次夸奖`}</Heading>
          <Section style={{ marginTop: 14 }}>
            <Text style={{ margin: 0, color: '#B891D1', fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700 }}>撤销内容</Text>
            <Text style={{ margin: '4px 0 0', fontSize: 14, color: '#5B3A8A', fontWeight: 700 }}>{`+${points} · ${reason}`}</Text>
          </Section>
          <Section style={{ marginTop: 16, padding: 14, background: '#FFEDF6', borderRadius: 14, border: '1.5px solid #FFCDE8' }}>
            <Text style={{ margin: 0, color: '#B891D1', fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700 }}>你今日剩余</Text>
            <Text style={{ margin: '4px 0 0', fontSize: 36, color: '#FF6FB5', fontWeight: 900 }}>{`${remaining}/100`}</Text>
          </Section>
          <Button href={appUrl} style={{ marginTop: 20, background: '#6FB8FF', color: '#FFFFFF', padding: '12px 18px', borderRadius: 14, border: '2px solid #FFFFFF', boxShadow: '3px 3px 0 #B4DCFF', fontWeight: 800, textDecoration: 'none', display: 'inline-block' }}>打开 LoveTax →</Button>
        </Container>
      </Body>
    </Html>
  );
}
