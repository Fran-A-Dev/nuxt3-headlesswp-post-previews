<template>
  <div>
    <Header></Header>
    <div v-if="error" class="text-red-500 p-6">Error: {{ error }}</div>
    <div v-else-if="pending" class="p-6 text-center">Loading...</div>
    <main
      v-else-if="data"
      class="bg-gray-100 container mx-auto mt-6 p-6 rounded-lg"
    >
      <h1 class="text-4xl">{{ data.title }}</h1>
      <div v-if="data.date" class="text-2xl mt-4">
        {{ new Date(data.date).toLocaleDateString() }}
      </div>
      <article class="mt-4 space-y-2" v-html="data.content"></article>
    </main>
    <div v-else class="p-6 text-center">Post not found</div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Header from "~/components/Header.vue";

const route = useRoute();
const uri = route.params.uri.join("/");
const config = useRuntimeConfig();
const error = ref(null);

const { data, pending } = await useFetch(
  `${config.public.wordpressUrl}/graphql`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      query: `
      query GetPost($uri: String!) {
        nodeByUri(uri: $uri) {
          ... on Post {
            id
            title
            date
            content
          }
        }
      }
      `,
      variables: {
        uri: uri,
      },
    },
    transform: (response) => response?.data?.nodeByUri || null,
    onResponseError(err) {
      error.value = err.message || "Failed to fetch post";
    },
  }
);

if (data.value?.title) {
  useHead({
    title: data.value.title,
  });
}
</script>
