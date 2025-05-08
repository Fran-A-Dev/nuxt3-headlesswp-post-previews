<template>
  <div>
    <TheHeader></TheHeader>
    <div v-if="pending" class="text-center p-6">Loading preview...</div>
    <div v-else-if="error" class="text-red-500 text-center p-6">
      {{ error.message }}
    </div>
    <main
      v-else-if="data"
      class="bg-gray-100 container mx-auto mt-6 p-6 rounded-lg"
    >
      <h1 class="text-4xl">{{ data.title }}</h1>
      <div v-if="data.date" class="text-2xl mt-4">
        {{ formatDate(data.date) }}
      </div>
      <article class="mt-4 space-y-2" v-html="data.content || ''"></article>
    </main>
    <div v-else class="text-center p-6">Post not found</div>
  </div>
</template>

<script setup>
const route = useRoute();
// Handle both parameter formats
const { code, preview_id } = route.query;
const previewId = preview_id;

const formatDate = (date) => {
  try {
    return new Date(date).toLocaleDateString();
  } catch (e) {
    return date;
  }
};

// Create composable for preview data
const usePreviewData = async () => {
  const config = useRuntimeConfig();
  const cookie = useCookie(`${config.public.frontendSiteUrl}-rt`);

  console.log("Preview page query params:", { code, previewId });

  // Try with the alternative endpoint
  try {
    let queryParams = {};

    // If we have a refresh token cookie, use it
    if (cookie.value) {
      queryParams = {
        refreshToken: cookie.value,
        previewId,
      };
    } else if (code) {
      queryParams = {
        code,
        previewId,
      };
    } else {
      throw createError({
        statusCode: 400,
        message: "No authorization code or refresh token available",
      });
    }

    console.log("Making preview request with params:", queryParams);

    const { data, pending, error } = await useFetch("/api/preview-alt", {
      method: "GET",
      query: queryParams,
    });

    // Handle the response structure from the new API
    return {
      data: computed(() => data.value?.data || null),
      pending,
      error: computed(() => {
        if (error.value) return error.value;
        if (data.value?.success === false) {
          return new Error(data.value?.message || "Unknown error");
        }
        return null;
      }),
    };
  } catch (e) {
    console.error("Preview request failed:", e);
    return {
      data: ref(null),
      pending: ref(false),
      error: ref(e),
    };
  }
};

const { data, pending, error } = await usePreviewData();

// Only set the head if we have data
if (data.value?.title) {
  useHead({
    title: data.value.title,
  });
}
</script>
