import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/preact';
import Walkthrough from '../../src/components/Walkthrough';

function clickGapItem(id: string) {
  // Find the gap ID span in the list, then click its parent button
  const spans = screen.getAllByText(id);
  const listItemSpan = spans.find((el) => el.closest('.walkthrough__gap-item'));
  if (listItemSpan) {
    fireEvent.click(listItemSpan.closest('.walkthrough__gap-item')!);
  }
}

function resolveAllGaps(gapIds: string[]) {
  for (const id of gapIds) {
    clickGapItem(id);
    fireEvent.click(screen.getByText('Resolve'));
  }
}

describe('Walkthrough Component', () => {
  describe('rendering', () => {
    it('should render pass tabs', () => {
      render(<Walkthrough />);
      expect(screen.getByText(/Pass 1/)).toBeInTheDocument();
      expect(screen.getByText(/Pass 2/)).toBeInTheDocument();
      expect(screen.getByText(/Pass 3/)).toBeInTheDocument();
    });

    it('should show gap counter with 18 remaining', () => {
      render(<Walkthrough />);
      expect(screen.getByText(/18 gaps remaining/)).toBeInTheDocument();
    });

    it('should render gap list for active pass', () => {
      render(<Walkthrough />);
      expect(screen.getByText('SG-01')).toBeInTheDocument();
      expect(screen.getByText('DG-04')).toBeInTheDocument();
    });

    it('should show gap detail when a gap is clicked', () => {
      render(<Walkthrough />);
      clickGapItem('SG-01');
      // Detail panel should show rule as blockquote
      expect(screen.getByText(/Aggregates must protect at least one invariant/)).toBeInTheDocument();
      // Should show analysis section
      expect(screen.getByText(/What prevents double-booking/)).toBeInTheDocument();
    });

    it('should show severity badges', () => {
      render(<Walkthrough />);
      const errorBadges = screen.getAllByText('Error');
      const warningBadges = screen.getAllByText('Warning');
      expect(errorBadges.length).toBeGreaterThan(0);
      expect(warningBadges.length).toBeGreaterThan(0);
    });

    it('should show the rule as a blockquote', () => {
      render(<Walkthrough />);
      fireEvent.click(screen.getByText('SG-01'));
      const rule = screen.getByText(/Aggregates must protect at least one invariant/);
      expect(rule.closest('blockquote')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should resolve a gap and decrement counter', () => {
      render(<Walkthrough />);
      clickGapItem('SG-01');
      fireEvent.click(screen.getByText('Resolve'));
      expect(screen.getByText(/17 gaps remaining/)).toBeInTheDocument();
    });

    it('should show resolved check mark after resolving', () => {
      render(<Walkthrough />);
      clickGapItem('SG-01');
      fireEvent.click(screen.getByText('Resolve'));
      expect(screen.getByLabelText('Resolved')).toBeInTheDocument();
    });

    it('should show resolution details after resolving', () => {
      render(<Walkthrough />);
      clickGapItem('SG-01');
      fireEvent.click(screen.getByText('Resolve'));
      // Select the resolved gap again to see details
      clickGapItem('SG-01');
      expect(screen.getByText(/Resolution/)).toBeInTheDocument();
      expect(screen.getByText(/INV-AP-01/)).toBeInTheDocument();
    });

    it('should show modification badge for SG-03', () => {
      render(<Walkthrough />);
      clickGapItem('SG-03');
      fireEvent.click(screen.getByText('Resolve'));
      clickGapItem('SG-03');
      expect(screen.getByText(/Accepted with modification/)).toBeInTheDocument();
    });

    it('should show progress bar filling as gaps resolve', () => {
      render(<Walkthrough />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar.getAttribute('aria-valuenow')).toBe('0');

      clickGapItem('SG-01');
      fireEvent.click(screen.getByText('Resolve'));

      const updatedBar = screen.getByRole('progressbar');
      const value = parseFloat(updatedBar.getAttribute('aria-valuenow') || '0');
      expect(value).toBeGreaterThan(0);
    });

    it('should enable Pass 2 tab after all Pass 1 gaps resolved', () => {
      render(<Walkthrough />);

      // Resolve all 18 gaps
      const gapIds = [
        'SG-01', 'SG-02', 'SG-03', 'SG-04', 'SG-05', 'SG-06', 'SG-07',
        'HG-01', 'HG-02', 'HG-03', 'HG-04', 'HG-05',
        'LG-01', 'LG-02',
        'DG-01', 'DG-02', 'DG-03', 'DG-04',
      ];

      resolveAllGaps(gapIds);

      // Should see advance button
      expect(screen.getByText(/Continue to Pass 2/)).toBeInTheDocument();
    });

    it('should show convergence state on Pass 3', () => {
      render(<Walkthrough />);

      // Resolve all Pass 1
      const p1Ids = [
        'SG-01', 'SG-02', 'SG-03', 'SG-04', 'SG-05', 'SG-06', 'SG-07',
        'HG-01', 'HG-02', 'HG-03', 'HG-04', 'HG-05',
        'LG-01', 'LG-02',
        'DG-01', 'DG-02', 'DG-03', 'DG-04',
      ];
      resolveAllGaps(p1Ids);
      fireEvent.click(screen.getByText(/Continue to Pass 2/));

      // Resolve all Pass 2
      const p2Ids = ['SG-P2-01', 'SG-P2-02', 'HG-P2-01', 'DG-P2-01', 'DG-P2-02'];
      resolveAllGaps(p2Ids);
      fireEvent.click(screen.getByText(/Continue to Pass 3/));

      // Should show converged state — text appears in counter and heading
      const convergedElements = screen.getAllByText(/Converged. Zero unresolved gaps./);
      expect(convergedElements.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/5 → 18/)).toBeInTheDocument(); // invariant growth
      expect(screen.getByText(/Run this on your own domain/)).toBeInTheDocument();
    });
  });

  describe('deep linking', () => {
    it('should pre-select a gap when initialGapId is provided', () => {
      render(<Walkthrough initialGapId="SG-03" />);
      // Should show the detail panel with the rule for SG-03
      expect(screen.getByText(/Command preconditions must enforce/)).toBeInTheDocument();
    });
  });
});
