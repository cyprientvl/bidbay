<script setup lang="ts">
import { useAuthStore } from "../store/auth";
import { useRoute, useRouter } from "vue-router";
import { ref, computed } from "vue";
import { queryGet, queryPut } from "@/utils/queryAPI";
import { Product } from "@/models/product";

const { isAuthenticated, token } = useAuthStore();
const router = useRouter();
const route = useRoute();
const productId = ref(route.params.productId);

const error = ref<boolean>(false);
const loading = ref<boolean>(false);

const product = ref<Product>({
  id: "", name: "", description: "", category: "", originalPrice: 0, pictureUrl: "", endDate: new Date(), sellerId: ""
});
const productEndDate = ref<string>("");


if (!isAuthenticated.value) {
  router.push({ name: "Login" });
}

async function getProduct(){

  try{
    const response = await queryGet<Product>(`products/${productId.value}`);
    product.value = response;
    product.value.endDate = new Date(product.value.endDate);
    let e = product.value.endDate
    productEndDate.value = `${e.getFullYear()}-${e.getMonth()+1 < 10 ? "0" +(e.getMonth()+1) : (e.getMonth()+1) }-${e.getDate() < 10 ? "0"+e.getDate():e.getDate()}`

  }catch(e){
    error.value = true;
  }

}

async function saveProduct(){

  loading.value = true;
  try{
    product.value.endDate = new Date(productEndDate.value);
    await queryPut(`products/${productId.value}`, product.value);
    router.push(`/products/${productId.value}`)
    error.value = false;
  }catch(e){
    error.value = true;
  }finally{
    loading.value = false;
  }
}

getProduct();

const reversed = computed(() =>{

if(product.value.category.trim() != "" 
&& product.value.description.trim() != ""
&& product.value.name.trim() != ""
&& product.value.originalPrice != 0
&& product.value.pictureUrl.trim() != ""
) return true;
return false

} )

</script>

<template>
  <h1 class="text-center">Modifier un produit</h1>

  <div class="row justify-content-center">
    <div class="col-md-6">
      <form>
        <div v-if="error" class="alert alert-danger mt-4" role="alert" data-test-error>
          Une erreur est survenue
        </div>

        <div class="mb-3">
          <label for="product-name"  class="form-label"> Nom du produit </label>
          <input
            type="text"
            class="form-control"
            id="product-name"
            v-model="product.name"
            required
            data-test-product-name
          />
        </div>

        <div class="mb-3">
          <label for="product-description" class="form-label">
            Description
          </label>
          <textarea
            class="form-control"
            id="product-description"
            name="description"
            rows="3"
            required
            v-model="product.description"
            data-test-product-description
          ></textarea>
        </div>

        <div class="mb-3">
          <label for="product-category" class="form-label"> Catégorie </label>
          <input
            type="text"
            class="form-control"
            id="product-category"
            required
            v-model="product.category"
            data-test-product-category
          />
        </div>

        <div class="mb-3">
          <label for="product-original-price" class="form-label">
            Prix de départ
          </label>
          <div class="input-group">
            <input
              type="number"
              class="form-control"
              id="product-original-price"
              name="originalPrice"
              step="1"
              min="0"
              required
              v-model="product.originalPrice"
              data-test-product-price
            />
            <span class="input-group-text">€</span>
          </div>
        </div>

        <div class="mb-3">
          <label for="product-picture-url" class="form-label">
            URL de l'image
          </label>
          <input
            type="url"
            class="form-control"
            id="product-picture-url"
            name="pictureUrl"
            required
            v-model="product.pictureUrl"
            data-test-product-picture
          />
        </div>

        <div class="mb-3">
          <label for="product-end-date" class="form-label">
            Date de fin de l'enchère
          </label>
          <input
            type="date"
            class="form-control"
            id="product-end-date"
            name="endDate"
            required
            data-test-product-end-date
            v-model="productEndDate"
          />
        </div>

        <div class="d-grid gap-2">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled = !reversed
            data-test-submit
            v-on:click.prevent="saveProduct()"
          >
            Modifier le produit
            <span v-if="loading"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
              data-test-spinner
            ></span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
