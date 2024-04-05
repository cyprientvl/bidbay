<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useAuthStore } from "../store/auth";
import { User } from "@/models/user";
import { queryGet } from "@/utils/queryAPI";
import { Product } from "@/models/product";
import { Bid } from "@/models/bid";


interface UserViewBid {
  id: string;
  username: string;
  email: string;
  admin: boolean;
  bids: BidView[];
  products: ProductsView[];
}

interface ProductsView extends Product{

}

interface ProductView {
  id: string;
  name: string;
}

interface BidView {
  id: string;
  bidAmount: number;
  bidDate: string;
  product: ProductView[];
}



interface UserViewProduct {
  id: string;
  category: string;
  description: string;
  endDate: string;
  name: string;
  originalPrice: number;
  pictureUrl: string;
  seller: {
    admin: boolean;
    createdAt: string;
    email: string;
    id: string;
    password: string;
    updatedAt: string;
    username: string;
  };
  bids: {
    bidAmount: number;
    bidDate: string;
    id: string;
    product: string;
  }
  sellerId: string;
}

const { isAuthenticated, userData } = useAuthStore();

const router = useRouter();
const route = useRoute();
const user = ref<User | null>(null);

const loading = ref(false);
const error = ref(false);
let userId = computed(() => route.params.userId);
let listProduct = ref<UserViewProduct[]>([])
let bids = ref<UserViewBid[]>([]);

async function fetchBids() {
  try {
    const response = await queryGet<UserViewBid[]>(`users/${userData.value?.id}`);
    bids.value = response;
    console.log(response);
  } catch (e) {
    console.error(e);
  }
}

async function fetchUser() {
  try {
    const response = await queryGet<User>(`users/${userData.value?.id}`);
    user.value = response;
  } catch (e) {
    console.error(e);
  }
}

async function fetchProducts() {
  loading.value = true;
  error.value = false;

  try {
    const response = await queryGet<UserViewProduct[]>("products");
    listProduct.value = response;

  } catch (e) {
    error.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchUser();
  fetchProducts();
  fetchBids();
});

function formatDate(value: Date): string {
  return new Date(value).toLocaleDateString();
}
</script>

<template>
  <div>
    <h1 class="text-center" data-test-username>
      Utilisateur {{ userId }}
      <span class="badge rounded-pill bg-primary" data-test-admin>Admin</span>
    </h1>
    <div class="text-center" data-test-loading>
      <span class="spinner-border"></span>
      <span>Chargement en cours...</span>
    </div>
    <div class="alert alert-danger mt-3" data-test-error>
      Une erreur est survenue
    </div>
    <div data-test-view>
      <div class="row">
        <div class="col-lg-6">
          <h2>Produits</h2>
          <div class="row">
            <div class="col-md-6 mb-6 py-2" v-for="(item, i) in listProduct" :key="i" data-test-product>
              <div class="card">
                <RouterLink :to="{ name: 'Product', params: { productId: item.id }}">
                  <img
                    :src="item.pictureUrl"
                    class="card-img-top" data-test-product-picture />
                </RouterLink>
                <div class="card-body">
                  <h5 class="card-title">
                    <RouterLink :to="{
        name: 'Product',
        params: { productId: item.id },
      }" data-test-product-name>
                      {{ item.name }}
                    </RouterLink>
                  </h5>
                  <p class="card-text" data-test-product-description>
                    {{ item.description }}
                  </p>
                  <p class="card-text" data-test-product-price>
                    Prix de départ : {{ item.originalPrice }} €
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <h2>Offres</h2>
          <table class="table table-striped">
            <thead>
              <tr>
                <th scope="col">Produit</th>
                <th scope="col">Offre</th>
                <th scope="col">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in bids" :key="i" data-test-bid>
                <td>
                  <RouterLink :to="{
        name: 'Product',
        params: { productId: 'TODO' },
      }" data-test-bid-product>
                    {{ item.bids}}
                  </RouterLink>
                </td>
                <td data-test-bid-price>{{ item.bids }} €</td>
                <td data-test-bid-date>{{ formatDate(new Date()) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
