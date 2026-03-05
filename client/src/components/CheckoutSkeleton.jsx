/**
 * Checkout Page Loading Skeleton
 * 
 * Displays while lazy-loading the Checkout page
 * Provides better perceived performance
 */

export default function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-48 mx-auto mb-4 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto animate-pulse" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6 animate-pulse" />
              
              {/* Form Fields */}
              <div className="space-y-4">
                {/* Name fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2 animate-pulse" />
                    <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2 animate-pulse" />
                    <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
                  </div>
                </div>

                {/* Address fields */}
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2 animate-pulse" />
                    <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-6 animate-pulse" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sticky top-24">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6 animate-pulse" />
              
              {/* Items */}
              <div className="space-y-4 mb-6">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t dark:border-gray-700 pt-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
                  </div>
                ))}
              </div>

              {/* Button */}
              <div className="mt-6 h-14 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="fixed bottom-8 right-8 bg-white dark:bg-gray-800 rounded-full shadow-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Loading checkout...
          </span>
        </div>
      </div>
    </div>
  );
}
