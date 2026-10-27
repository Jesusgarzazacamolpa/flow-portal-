import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorPanel } from './ErrorPanel';

describe('ErrorPanel', () => {
  it('shows the error message', () => {
    render(<ErrorPanel message="Algo falló" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Algo falló');
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
  });

  it('runs the retry handler', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<ErrorPanel message="Algo falló" onRetry={onRetry} />);

    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
