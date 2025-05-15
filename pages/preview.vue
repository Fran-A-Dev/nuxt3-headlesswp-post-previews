<template>
  <div>
    <Header></Header>
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
import Header from "~/components/Header.vue";

const route = useRoute();
const { code, preview_id } = route.query;
const previewId = preview_id;
const config = useRuntimeConfig();
const cookie = useCookie("faust_preview_rt");

// Format date with validation
const formatDate = (date) => {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString() : date;
};

// Prepare query parameters
let queryParams = {};

if (cookie.value) {
  queryParams = { refreshToken: cookie.value, previewId };
} else if (code) {
  queryParams = { code, previewId };
} else {
  throw createError({
    statusCode: 400,
    message: "No authorization code or refresh token available",
  });
}

// Fetch preview data
const {
  data: fetchData,
  pending,
  error: fetchError,
} = await useFetch("/api/preview", {
  method: "GET",
  query: queryParams,
});

// Process the response
const data = computed(() => fetchData.value?.data || null);
const error = computed(() => {
  if (fetchError.value) return fetchError.value;
  if (fetchData.value?.success === false) {
    return new Error(fetchData.value?.message || "Unknown error");
  }
  return null;
});

// Set page title if we have data
if (data.value?.title) {
  useHead({
    title: data.value.title,
  });
}
</script>
