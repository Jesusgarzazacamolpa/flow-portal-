import { render, screen } from '@testing-library/react';
import { FullPageLoader } from './FullPageLoader';

describe('FullPageLoader', () => {
  it('announces the loading state', () => {
    render(<FullPageLoader label="Cargando módulos…" />);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando módulos…');
  });

  it('uses a default label', () => {
    render(<FullPageLoader />);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando…');
  });
});
