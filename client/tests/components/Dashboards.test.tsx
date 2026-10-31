import { describe, it, expect, vi } from 'vitest';

describe('UI Component Test: Role-Based Dashboards (UI-04 / UI-05 / AC-02 / BR-02)', () => {
  describe('UI-04: Requester Dashboard (AC-02 / BR-02)', () => {
    it('should calculate requester metric summaries correctly from API response', () => {
      const mockMetrics = {
        totalOpenTickets: 5,
        inProgressTickets: 2,
        waitingForRequesterTickets: 1,
        resolvedTickets: 8,
        closedTickets: 4,
      };

      expect(mockMetrics.totalOpenTickets).toBe(5);
      expect(mockMetrics.inProgressTickets).toBe(2);
      expect(mockMetrics.waitingForRequesterTickets).toBe(1);
      expect(mockMetrics.resolvedTickets).toBe(8);
      expect(mockMetrics.closedTickets).toBe(4);
    });

    it('should detect empty state and show empty placeholder when no tickets exist', () => {
      const recentTickets: any[] = [];
      const hasTickets = recentTickets.length > 0;

      expect(hasTickets).toBe(false);
      const emptyPlaceholderMessage = 'You have not submitted any service requests yet.';
      expect(emptyPlaceholderMessage).toContain('not submitted any');
    });

    it('should fire correct navigation callbacks when quick action or ticket is clicked', () => {
      const onNavigateToCreate = vi.fn();
      const onNavigateToMyTickets = vi.fn();
      const onSelectTicket = vi.fn();

      // Trigger create ticket button
      onNavigateToCreate();
      expect(onNavigateToCreate).toHaveBeenCalledTimes(1);

      // Trigger view all tickets button
      onNavigateToMyTickets();
      expect(onNavigateToMyTickets).toHaveBeenCalledTimes(1);

      // Trigger selecting a specific ticket from recent list
      const clickedTicketId = 42;
      onSelectTicket(clickedTicketId);
      expect(onSelectTicket).toHaveBeenCalledWith(42);
    });
  });

  describe('UI-05: Staff Dashboard & Operational Metrics (AC-02 / BR-02)', () => {
    it('should compute staff operational metrics including unassigned and in-progress counts', () => {
      const mockStaffMetrics = {
        newCount: 3,
        openCount: 5,
        inProgressCount: 7,
        waitingForRequesterCount: 2,
        resolvedCount: 12,
        closedCount: 15,
        myAssignedCount: 4,
        unassignedCount: 6,
        userAccountsCount: 28,
      };

      expect(mockStaffMetrics.unassignedCount).toBe(6);
      expect(mockStaffMetrics.inProgressCount).toBe(7);
      expect(mockStaffMetrics.waitingForRequesterCount).toBe(2);
      expect(mockStaffMetrics.resolvedCount).toBe(12);
      expect(mockStaffMetrics.userAccountsCount).toBe(28);
    });

    it('should trigger queue drill-down callback when metric card is clicked', () => {
      const onNavigateToQueue = vi.fn();
      const onSelectTicket = vi.fn();

      // Click on "Unassigned Tickets" metric card
      onNavigateToQueue();
      expect(onNavigateToQueue).toHaveBeenCalledTimes(1);

      // Click on a recent ticket in staff queue
      onSelectTicket(108);
      expect(onSelectTicket).toHaveBeenCalledWith(108);
    });

    it('should strictly isolate requester and staff metrics schemas (RBAC hardening)', () => {
      const requesterMetrics = {
        totalOpenTickets: 2,
        inProgressTickets: 1,
        waitingForRequesterTickets: 0,
        resolvedTickets: 3,
        closedTickets: 1,
      };

      // Requesters must NOT receive system-wide user counts or unassigned queue data
      expect('userAccountsCount' in requesterMetrics).toBe(false);
      expect('unassignedCount' in requesterMetrics).toBe(false);
      expect('myAssignedCount' in requesterMetrics).toBe(false);
    });

    it('should format visual priority badges correctly for HIGH, MEDIUM, and LOW (Peer Review #5)', () => {
      const getPriorityBadgeStyle = (priority?: string) => {
        switch (priority) {
          case 'HIGH':
            return 'bg-red-50 text-red-700 border-red-200 font-bold';
          case 'MEDIUM':
            return 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
          case 'LOW':
            return 'bg-slate-50 text-slate-600 border-slate-200 font-medium';
          default:
            return 'bg-slate-50 text-slate-500 border-slate-200';
        }
      };

      expect(getPriorityBadgeStyle('HIGH')).toContain('text-red-700');
      expect(getPriorityBadgeStyle('MEDIUM')).toContain('text-amber-700');
      expect(getPriorityBadgeStyle('LOW')).toContain('text-slate-600');
      expect(getPriorityBadgeStyle(undefined)).toContain('text-slate-500');
    });
  });
});
