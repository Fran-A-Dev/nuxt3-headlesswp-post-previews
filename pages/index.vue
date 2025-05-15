<script setup>
import { ref } from "vue";
import Post from "~/components/Post.vue";
import Header from "~/components/Header.vue";

const config = useRuntimeConfig();
const error = ref(null);

const query = `
  query {
    posts {
      nodes {
        title
        date
        excerpt
        uri
      }
    }
  }
`;

const { data, pending } = await useFetch(
  `${config.public.wordpressUrl}/graphql`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      query,
    },
    transform: (response) => response?.data?.posts?.nodes || [],
    onResponseError(error) {
      error.value = error.message || "Failed to fetch posts";
    },
  }
);
</script>

<template>
  <div>
    <Header />
    <div class="grid gap-8 grid-cols-1 lg:grid-cols-3 p-6">
      <template v-if="!pending && data">
        <Post v-for="post in data" :key="post.uri" :post="post" />
      </template>
      <div v-else-if="error" class="text-red-500 p-6">Error: {{ error }}</div>
      <div v-else class="col-span-3 text-center p-6">Loading...</div>
    </div>
  </div>
</template>
