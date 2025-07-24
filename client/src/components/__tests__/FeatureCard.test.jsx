// client/src/components/__tests__/FeatureCard.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event'; // Import userEvent
import '@testing-library/jest-dom';
import FeatureCard from '../FeatureCard'; // Adjust path as needed
import { Mail } from 'lucide-react'; // Assuming lucide-react is used for icons

// Mock React.useId to return a predictable ID for testing
// This makes the generated IDs consistent across test runs.
jest.mock('react', () => ({
  ...jest.requireActual('react'), // Import and retain default behavior
  useId: () => 'mocked-id', // Mock useId to return a static value
}));

describe('FeatureCard', () => {
  const testProps = {
    icon: <Mail data-testid="foreground-icon" />,
    title: 'Workflow Automation',
    description: 'Automate routine tasks and notifications.',
    backgroundIcon: <Mail data-testid="background-svg-icon" />,
  };

  it('renders correctly with all props in initial state', () => {
    render(<FeatureCard {...testProps} />);

    // Assert that the title and description are in the document
    expect(screen.getByText(testProps.title)).toBeInTheDocument();
    expect(screen.getByText(testProps.description)).toBeInTheDocument();

    // Assert that icons are rendered
    expect(screen.getByTestId('foreground-icon')).toBeInTheDocument();
    expect(screen.getByTestId('background-svg-icon')).toBeInTheDocument();

    // Assert initial styles (not hovered) - check for classes
    const cardElement = screen.getByText(testProps.title).closest('.group');
    expect(cardElement).toHaveClass('bg-white');
    expect(cardElement).not.toHaveClass('hover:bg-black'); // Not hovered initially

    // Assert initial arrow visibility (should be hidden)
    const arrow = screen.getByText('→');
    expect(arrow).toHaveClass('opacity-0');
    expect(arrow).not.toHaveClass('group-hover:opacity-100');
  });

  it('applies correct IDs to SVG elements using mocked useId', () => {
    render(<FeatureCard {...testProps} />);

    // Check if the linearGradient and mask elements have the correct mocked IDs
    const gradient = document.getElementById('gradient-mocked-id');
    const mask = document.getElementById('mask-mocked-id');

    expect(gradient).toBeInTheDocument();
    expect(mask).toBeInTheDocument();
    expect(gradient).toHaveAttribute('id', 'gradient-mocked-id');
    expect(mask).toHaveAttribute('id', 'mask-mocked-id');

    // Check if the rect uses the correct gradient ID
    const rectInMask = mask.querySelector('rect');
    expect(rectInMask).toBeInTheDocument();
    expect(rectInMask).toHaveAttribute('fill', 'url(#gradient-mocked-id)');

    // Check if the background icon uses the correct mask ID
    const backgroundIconElement = screen.getByTestId('background-svg-icon');
    expect(backgroundIconElement).toHaveAttribute('mask', 'url(#mask-mocked-id)');
  });


  it('changes styles and arrow visibility on hover', async () => {
    const user = userEvent.setup();
    render(<FeatureCard {...testProps} />);

    const cardElement = screen.getByText(testProps.title).closest('.group');
    const titleElement = screen.getByText(testProps.title);
    const descriptionElement = screen.getByText(testProps.description);
    const foregroundIconContainer = screen.getByTestId('foreground-icon').closest('div');
    const arrow = screen.getByText('→');

    // Simulate mouse entering
    await user.hover(cardElement);

    // Assert hover styles
    expect(cardElement).toHaveClass('hover:bg-black'); // This class is applied on hover
    expect(cardElement).toHaveClass('bg-black'); // Actual class on element after hover (Tailwind applies it)

    // Check text/icon color changes (asserting on the actual current class)
    expect(foregroundIconContainer).toHaveClass('group-hover:text-white');
    expect(foregroundIconContainer).toHaveClass('text-white'); // Actual class on element after hover
    expect(titleElement).toHaveClass('text-white'); // Check if title text color changes
    expect(descriptionElement).toHaveClass('text-gray-300'); // Check if description text color changes

    // Assert arrow visibility and translation on hover
    expect(arrow).toHaveClass('group-hover:opacity-100');
    expect(arrow).toHaveClass('opacity-100'); // Actual class on element after hover
    expect(arrow).toHaveClass('group-hover:translate-x-1');
  });

  it('reverts styles and arrow visibility on mouse leave', async () => {
    const user = userEvent.setup();
    render(<FeatureCard {...testProps} />);

    const cardElement = screen.getByText(testProps.title).closest('.group');
    const arrow = screen.getByText('→');
    const foregroundIconContainer = screen.getByTestId('foreground-icon').closest('div');
    const titleElement = screen.getByText(testProps.title);
    const descriptionElement = screen.getByText(testProps.description);


    // Simulate mouse entering and then leaving
    await user.hover(cardElement);
    expect(cardElement).toHaveClass('bg-black'); // Should be hovered

    await user.unhover(cardElement); // Simulate mouse leaving

    // Assert styles revert to initial state
    expect(cardElement).toHaveClass('bg-white'); // Should revert to white background
    expect(cardElement).not.toHaveClass('bg-black'); // Should not be black anymore

    // Check text/icon color changes revert
    expect(foregroundIconContainer).not.toHaveClass('text-white'); // Should revert
    expect(titleElement).not.toHaveClass('text-white'); // Should revert
    expect(descriptionElement).not.toHaveClass('text-gray-300'); // Should revert

    // Assert arrow visibility and translation revert
    expect(arrow).toHaveClass('opacity-0'); // Should revert to hidden
    expect(arrow).not.toHaveClass('opacity-100');
    expect(arrow).not.toHaveClass('translate-x-1'); // Translation should revert
  });

  it('renders correctly without backgroundIcon prop', () => {
    const propsWithoutBackground = {
      icon: <Mail data-testid="foreground-icon" />,
      title: 'No Background Icon',
      description: 'Card without a background SVG.',
      backgroundIcon: null, // Explicitly null
    };

    render(<FeatureCard {...propsWithoutBackground} />);

    expect(screen.getByText('No Background Icon')).toBeInTheDocument();
    // Ensure the background SVG container is not rendered
    expect(screen.queryByTestId('background-svg-icon')).not.toBeInTheDocument();
    // Also check that the SVG and its defs are not in the document
    expect(document.getElementById('gradient-mocked-id')).not.toBeInTheDocument();
    expect(document.getElementById('mask-mocked-id')).not.toBeInTheDocument();
  });
});