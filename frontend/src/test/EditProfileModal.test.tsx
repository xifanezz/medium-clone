/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditProfileModal } from '../component/EditProfileModal';
import { UserProfile } from '../types';

// --- FIX: The mock profile now includes all properties, matching the component's expectation ---
const mockProfile: UserProfile = {
  id: '123',
  username: 'testuser',
  displayName: 'Test User',
  bio: 'Initial bio.',
  avatar: '',
  coverImage: '', // Added
  location: '',   // Added
  website: '',    // Added
  joinedDate: new Date().toISOString(),
  followersCount: 0,
  followingCount: 0,
  postsCount: 0,
  isFollowing: false,
  isOwnProfile: true,
};

describe('EditProfileModal', () => {
  it('should call onSave with only the updated fields when the form is submitted', async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();
    const handleClose = vi.fn();

    render(
      <EditProfileModal
        isOpen={true}
        onClose={handleClose}
        profile={mockProfile}
        onSave={handleSave}
        isSaving={false}
        saveError={null}
      />
    );

    const displayNameInput = screen.getByLabelText('Display Name');
    await user.clear(displayNameInput);
    await user.type(displayNameInput, 'Updated Display Name');

    const saveButton = screen.getByRole('button', { name: 'Save Changes' });
    await user.click(saveButton);

    expect(handleSave).toHaveBeenCalledTimes(1);
    // This assertion will now pass because the payload won't contain the extra empty string fields
    expect(handleSave).toHaveBeenCalledWith({
      displayName: 'Updated Display Name',
    });
  });

  it('should not call onSave if no changes have been made', async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();
    const handleClose = vi.fn();

    render(
      <EditProfileModal
        isOpen={true}
        onClose={handleClose}
        profile={mockProfile}
        onSave={handleSave}
        isSaving={false}
        saveError={null}
      />
    );

    const saveButton = screen.getByRole('button', { name: 'Save Changes' });
    await user.click(saveButton);

    // This assertion will now pass because no "changes" will be detected
    expect(handleSave).not.toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
