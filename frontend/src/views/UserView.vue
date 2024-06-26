<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { queryGet } from "@/utils/queryAPI";
import { useAuthStore } from "../store/auth";
import { Product } from "@/models/product";
import { Bid } from "@/models/bid";
const { isAuthenticated, userData } = useAuthStore();

interface User{
  admin: boolean,
  email: string,
  id: string,
  username: string
  products: Product[],
  bids: UserViewBids[]

}

interface UserViewBids extends Bid{
  product: {id: string, name: string}
}


const route = useRoute();


const user = ref<User>({id: "", admin: false, username: "", products: [], bids: [], email: ""});
const loading = ref(false);
const error = ref(false);

let userId = computed(() => route.params.userId);

async function fetchUser(idUser: string) : Promise<void> {
  loading.value = true;
  error.value = false;

  try{
    let id;
    if (idUser === "me") {
      id = userData.value?.id;
    } else {
      id = idUser;
    }
  
    const response = await queryGet<User>(`users/${id}`);
    console.log(response);
    user.value = response;
  }catch(e){
    console.log(e);
    error.value = true;
  }finally {
    loading.value = false;
  }

}

if (!isAuthenticated) {
  window.location.href = "LoginView.vue";
}

if (window.location.href.startsWith("http://localhost:5173/users/")) {
  let userId = "";
  if (window.location.href.includes("me")) {
    fetchUser("me");
  } else {
    const regex = /http:\/\/localhost:5173\/users\/(.+)/;
    const match = window.location.href.match(regex);
    if (match && match.length > 1) {
      userId = match[1];
    }
    fetchUser(userId);
  }
}

</script>

<template>
  <div>
    <h1 class="text-center" data-test-username>
      {{ user ? user.username : "noName" }}
      <span v-if="user ? user.admin : 'noAdmin ?? Debug call ethan'" class="badge rounded-pill bg-primary"
        data-test-admin>Admin
      </span>
    </h1>
    <div class="text-center" v-if="loading" data-test-loading>
      <span class="spinner-border"></span>
      <span>Chargement en cours...</span>
    </div>
    <div class="alert alert-danger mt-3" v-if="error" data-test-error>
      Une erreur est survenue
    </div>
    <div v-if="!error && !loading" data-test-view>
      <div class="row">
        <div class="col-lg-6">
          <h2>Produits</h2>
          <div class="row">
            <div class="col-md-6 mb-6 py-2" v-for="product in user ? user.products : null" :key="product.id"
              data-test-product>
              <div class="card">
                <RouterLink :to="{ name: 'Product', params: { productId: product.id } }">
                  <img :src="product.pictureUrl" class="card-img-top"
                    alt="L'image n'est pas dans les dossiers de Bid-Bay !" data-test-product-picture />
                </RouterLink>
                <div class="card-body">
                  <h5 class="card-title">
                    <RouterLink :to="{
                      name: 'Product',
                      params: { productId: product.id },
                    }" data-test-product-name>
                      {{ product.name }}
                    </RouterLink>
                  </h5>
                  <p class="card-text" data-test-product-description>
                    {{ product.description }}
                  </p>
                  <p class="card-text" data-test-product-price>
                    Prix de départ : {{ product.originalPrice }} €
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
              <tr v-for="bid in user ? user.bids : null" :key="bid.id" data-test-bid>
                <td>
                  <RouterLink :to="{
                    name: 'Product',
                    params: { productId: bid.product.id },
                  }" data-test-bid-product>
                    {{ bid.product.name }}
                  </RouterLink>
                </td>
                <td data-test-bid-price>{{ bid.price }} €</td>
                <td data-test-bid-date>{{ bid.date }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>