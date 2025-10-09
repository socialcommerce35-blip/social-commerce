import { IUserProfile, UserProfile } from '../models/user.model';


function formatDOB(dobInput: any): string {
  let date: Date;
  console.log('dob', dobInput, typeof dobInput)

  if (!dobInput) {
    throw new Error('DOB is required');
  }


  // If input is already a Date object
  if (dobInput instanceof Date) {
    date = dobInput;
  }
  // If input is a number (timestamp)
  else if (typeof dobInput === 'number') {
    date = new Date(dobInput);
  }
  // If input is string
  else if (typeof dobInput === 'string') {
    // Try parsing as ISO string or other valid formats
    date = new Date(dobInput);
    console.log('retrrr')
    if (isNaN(date.getTime())) {
      // Try DD-MM-YYYY manually
      const [day, month, year] = dobInput.split('-').map(Number);
      if (!day || !month || !year) throw new Error('Invalid DOB format');
      date = new Date(year, month - 1, day); // month is 0-indexed
    }
  } else {
    throw new Error('Invalid DOB type');
  }

  if (isNaN(date.getTime())) throw new Error('Invalid date');

  // Format as DD-MM-YYYY
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();

  console.log('retr')

  return `${dd}-${mm}-${yyyy}`;
}

export const getUserProfile = async (userId: string): Promise<IUserProfile | null> => {
  return UserProfile.findOne({ userId });
};

  interface UpdateData {
    username?: string;
    email?: string | null;
    mobile?: string;
    profile?: {
      firstName?: string | null;
      lastName?: string | null;
      avatar?: { url?: string; publicId?: string };
      gender?: string | null;
      dateOfBirth?: any;
      bio?: string | null;
      username?: string;
    };
    preferences?: {
      buckets?: string[];
      styles?: string[];
    };
    onboardingCompleted?: boolean;
    consentAccepted?: boolean;
  }
  
export const updateOrCreateUserProfile = async (
    userId: string,
    mobile: string,
    role: string,
    data: UpdateData
  ): Promise<IUserProfile> => {
    if (!userId) {
      throw new Error('Token missing — please log in again.');
    }
  
    // Check for empty data
    if (!data || Object.keys(data).length === 0) {
      throw new Error('Nothing to update! Please provide some data.');
    }
  
    let userProfile = await UserProfile.findOne({ userId });
  
    const now = Date.now();
  
    // CREATE
    if (!userProfile) {
      if (!data.username?.trim()) {
        throw new Error('🤔 Username is required!');
      }
      if (!data.consentAccepted) {
        throw new Error('📜 You must accept the terms & conditions.');
      }
  
      userProfile = await UserProfile.create({
        userId,
        profile: {
          firstName: data.profile?.firstName ?? null,
          lastName: data.profile?.lastName ?? null,
          avatar: {
            url: data.profile?.avatar?.url ?? null,
            publicId: data.profile?.avatar?.publicId ?? null,
          },
          gender: data.profile?.gender ?? null,
          dateOfBirth: formatDOB(data.profile?.dateOfBirth) ?? null,
          bio: data.profile?.bio ?? null,
          username: data.username.trim(),
        },
        email: data.email ?? null,
        mobile: mobile ?? null,
        buckets: (data.preferences?.buckets || []).map((bucketId: string) => ({
          bucketId,
          selectedAt: now,
        })),
        styles: (data.preferences?.styles || []).map((styleId: string) => ({
          styleId,
          selectedAt: now,
        })),
        derived: {
          priceRanges: [],
          brandIds: [],
          styleIds: [],
        },
        onboardingCompleted: data.onboardingCompleted ?? false,
        role: role || "user",
        consentAcceptedOn: now,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      return userProfile;
    }
  
    // UPDATE
    if (role !== 'admin' && userProfile.userId !== userId) {
      throw new Error('🙈 You cannot update someone else’s profile.');
    }
  
    // Update profile fields
    userProfile.profile = {
      firstName: data.profile?.firstName ?? userProfile.profile?.firstName ?? null,
      lastName: data.profile?.lastName ?? userProfile.profile?.lastName ?? null,
      avatar: {
        url: data.profile?.avatar?.url ?? userProfile.profile?.avatar?.url ?? null,
        publicId: data.profile?.avatar?.publicId ?? userProfile.profile?.avatar?.publicId ?? null,
      },
      gender: data.profile?.gender ?? userProfile.profile?.gender ?? null,
      // dateOfBirth: data.profile?.dateOfBirth ?? userProfile.profile?.dateOfBirth ?? null,
      bio: data.profile?.bio ?? userProfile.profile?.bio ?? null,
      username: data.profile?.username ?? userProfile.profile?.username
    };
  
    userProfile.email = data.email ?? userProfile.email ?? null;
  
    // Buckets safely append new
    if (data.preferences?.buckets) {
      const existingBucketIds = new Set(userProfile.buckets?.map(b => b.bucketId));
      const newBuckets = data.preferences.buckets
        .filter(id => !existingBucketIds.has(id))
        .map(bucketId => ({ bucketId, selectedAt: now }));
      userProfile.buckets = [...(userProfile.buckets || []), ...newBuckets];
    }
  
    // Styles safely append new
    if (data.preferences?.styles) {
      const existingStyleIds = new Set(userProfile.styles?.map(s => s.styleId));
      const newStyles = data.preferences.styles
        .filter(id => !existingStyleIds.has(id))
        .map(styleId => ({ styleId, selectedAt: now }));
      userProfile.styles = [...(userProfile.styles || []), ...newStyles];
    }
  
    // Derived fields
    userProfile.derived = {
      priceRanges: userProfile.derived?.priceRanges ?? [],
      brandIds: userProfile.derived?.brandIds ?? [],
      styleIds: userProfile.derived?.styleIds ?? [],
    };
  
    userProfile.onboardingCompleted = data.onboardingCompleted ?? userProfile.onboardingCompleted;
    userProfile.updatedAt = now;
    await userProfile.save();
  
    return userProfile;
  };
  