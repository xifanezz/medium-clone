import React from 'react';

// --- Blog Skeletons ---

export const BlogCardSkeleton: React.FC = () => (
  <div className="py-8 border-b border-gray-100 animate-pulse">
    <div className="flex flex-col-reverse sm:flex-row gap-6 sm:gap-8">
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        
        <div className="flex-grow">
          <div className="h-6 md:h-7 bg-gray-300 rounded w-11/12 mb-2"></div>
          <div className="h-6 md:h-7 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-4">
            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
      <div className="w-full sm:w-32 md:w-48 flex-shrink-0">
        <div className="aspect-square bg-gray-200 rounded-md"></div>
      </div>
    </div>
  </div>
);

export const BlogPageSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="max-w-4xl mx-auto px-6 sm:px-8 pt-12 pb-8">
      <div className="text-center mb-12">
        <div className="h-7 w-44 bg-gray-200 rounded-full mx-auto mb-6"></div>
        <div className="h-12 bg-gray-300 rounded-lg w-3/4 mx-auto mb-4"></div>
        <div className="h-12 bg-gray-300 rounded-lg w-1/2 mx-auto mb-8"></div>
      </div>
    </div>
    <div className="max-w-5xl mx-auto px-6 sm:px-8 mb-12">
        <div className="w-full h-96 bg-gray-200 rounded-xl"></div>
    </div>
    <div className="max-w-3xl mx-auto px-6 sm:px-8 pb-20">
      <div className="space-y-4">
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        <div className="h-8 my-6 bg-gray-300 rounded w-1/3"></div>
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      </div>
    </div>
  </div>
);

// --- Profile Skeletons ---

const ProfileHeaderSkeleton = () => (
  <div className="relative -mt-16">
    <div className="h-48 sm:h-64 bg-gray-200 rounded-t-xl"></div>
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-end sm:space-x-5">
        <div className="flex-shrink-0 -mt-16 sm:-mt-20">
          <div className="w-36 h-36 bg-gray-300 rounded-full border-4 border-white shadow-lg"></div>
        </div>
        <div className="mt-4 sm:mt-0 flex-1 flex flex-col sm:flex-row items-center justify-between w-full pb-4 sm:pb-6">
          <div className="text-center sm:text-left">
            <div className="h-8 bg-gray-300 rounded w-48 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <div className="h-10 w-32 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ProfileInfoSkeleton = () => (
    <div className="p-6 border-t border-gray-100">
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div className="h-5 w-28 bg-gray-200 rounded"></div>
                <div className="h-5 w-24 bg-gray-200 rounded"></div>
                <div className="h-5 w-20 bg-gray-200 rounded"></div>
            </div>
        </div>
    </div>
);

const ProfileTabsAndPostsSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm">
        <div className="h-14 border-b border-gray-200 flex items-end px-6">
            <div className="flex space-x-8">
                <div className="h-10 w-24 bg-gray-200 rounded-t-lg"></div>
                <div className="h-10 w-28 bg-gray-200 rounded-t-lg"></div>
            </div>
        </div>
        <div className="p-6 md:p-8">
            <PostsListSkeleton />
        </div>
    </div>
);

export const ProfilePageSkeleton: React.FC = () => (
    <div className="animate-pulse">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <ProfileHeaderSkeleton />
              <ProfileInfoSkeleton />
            </div>
            <ProfileTabsAndPostsSkeleton />
        </div>
    </div>
);


// --- Other Skeletons ---

export const PostsListSkeleton: React.FC = () => (
    <div className="divide-y divide-gray-100">
        {[...Array(3)].map((_, i) => (
            <BlogCardSkeleton key={i} />
        ))}
    </div>
);

const CommentItemSkeleton = () => (
    <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
        <div className="flex-1">
            <div className="bg-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
            </div>
        </div>
    </div>
);

export const CommentSectionSkeleton: React.FC = () => (
    <div className="p-6 space-y-6 animate-pulse">
        {[...Array(3)].map((_, i) => (
            <CommentItemSkeleton key={i} />
        ))}
    </div>
);

export const TagFilterSkeleton = () => (
  <div className="py-4 border-b border-gray-200 animate-pulse">
      <div className="flex items-center space-x-3 overflow-hidden">
          {[...Array(7)].map((_, i) => (
              <div key={i} className="h-8 w-24 bg-gray-200 rounded-full"></div>
          ))}
      </div>
  </div>
);

export const EditPageSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
        <div className="mb-6">
            <div className="w-full h-40 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-10 bg-gray-300 rounded w-full mb-6"></div>
        <div className="w-full min-h-[400px] space-y-4">
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  );
};
