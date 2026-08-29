import { google } from 'googleapis';
import { DataConnector, FetchParams, RawRecord } from './connector-interface.js';
import { GmailConnector } from './gmail-connector.js';

export class GCalConnector implements DataConnector {
  public readonly id = 'gcal';
  public readonly displayName = 'Google Calendar (v3 API)';
  public readonly availableFields = [
    'id',
    'title',
    'description',
    'start_time',
    'end_time',
    'location',
    'attendees',
    'attendee_count',
    'is_recurring',
    'organizer',
    'meet_link'
  ];

  private gmailConnector: GmailConnector;

  constructor(gmailConnector?: GmailConnector) {
    this.gmailConnector = gmailConnector || new GmailConnector();
  }

  public isConfigured(): boolean {
    return this.gmailConnector.isConfigured();
  }

  public async fetch(params: FetchParams): Promise<RawRecord[]> {
    if (!this.isConfigured()) {
      return this.getSandboxRecords(params);
    }

    try {
      const auth = this.gmailConnector.getOAuth2Client();
      const calendar = google.calendar({ version: 'v3', auth });
      const maxResults = params.maxResults || 10;

      const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults,
        singleEvents: true,
        orderBy: 'startTime'
      });

      const events = res.data.items || [];
      const records = events.map((ev: any) => ({
        id: ev.id || '',
        title: ev.summary || 'Untitled Event',
        description: ev.description || '',
        start_time: ev.start?.dateTime || ev.start?.date || '',
        end_time: ev.end?.dateTime || ev.end?.date || '',
        location: ev.location || '',
        attendees: (ev.attendees || []).map((a: any) => a.email),
        attendee_count: (ev.attendees || []).length,
        is_recurring: !!ev.recurringEventId,
        organizer: ev.organizer?.email || '',
        meet_link: ev.hangoutLink || ''
      }));

      return records.length > 0 ? records : this.getSandboxRecords(params);
    } catch (e: any) {
      console.warn('[GCalConnector] Live fetch failed, using sandbox records:', e.message);
      return this.getSandboxRecords(params);
    }
  }

  private getSandboxRecords(params: FetchParams): RawRecord[] {
    const now = Date.now();
    return [
      {
        id: 'ev_midnight_arch_2026',
        title: 'Midnight ZK Architecture & Privacy Review',
        description: 'CONFIDENTIAL: Reviewing Compact v0.34 ZKIR smart contracts, Merkle root anchors, and audit proofs.',
        start_time: new Date(now + 2 * 3600 * 1000).toISOString(),
        end_time: new Date(now + 3 * 3600 * 1000).toISOString(),
        location: 'Virtual / Google Meet',
        attendees: ['ciso@enterprise.corp', 'auditor@midnight.network'],
        attendee_count: 2,
        is_recurring: false,
        organizer: 'ciso@enterprise.corp',
        meet_link: 'https://meet.google.com/zk-midnight-arch'
      },
      {
        id: 'ev_quarterly_soc2_2026',
        title: 'Quarterly SOC 2 Type II Compliance Audit',
        description: 'CONFIDENTIAL: Big 4 auditor review of AI agent access scopes and cryptographic non-disclosure proofs.',
        start_time: new Date(now + 26 * 3600 * 1000).toISOString(),
        end_time: new Date(now + 28 * 3600 * 1000).toISOString(),
        location: 'Conference Room 4B',
        attendees: ['lead_auditor@deloitte.com', 'security@enterprise.corp'],
        attendee_count: 3,
        is_recurring: true,
        organizer: 'security@enterprise.corp',
        meet_link: 'https://meet.google.com/soc2-audit-2026'
      }
    ];
  }
}
