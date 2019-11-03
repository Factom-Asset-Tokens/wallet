<template>
  <v-container>
    <v-layout>
      <v-form @submit.prevent="accept">
        <v-card>
          <v-card-text>
            <v-layout wrap mb-3>
              <v-flex xs12>
                <v-checkbox
                  color="secondary"
                  hide-details
                  v-model="fundSafetyResponsability"
                  label="I understand that I am responsible for the safety of my funds and that nobody is able to recover my
                    funds in case of data loss or if I lose my credentials."
                ></v-checkbox>
              </v-flex>
              <v-flex xs12>
                <v-checkbox
                  color="secondary"
                  v-model="licenseAgreement"
                  hide-details
                  label="I have read, understood and agree to the following license:"
                ></v-checkbox>
              </v-flex>
              <v-flex xs12 mt-3>
                <v-sheet color="lightGrey">
                  <blockquote class="blockquote">
                    <p v-html="license"></p>
                  </blockquote>
                </v-sheet>
              </v-flex>
            </v-layout>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" type="submit" :disabled="!fundSafetyResponsability || !licenseAgreement"
              >Continue</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-form>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'AcceptLicense',
  data() {
    return {
      fundSafetyResponsability: false,
      licenseAgreement: false,
      license: `<p>MIT License</p>

<p>Copyright (c) 2019 Luciap Technology Inc.</p>

<p>Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:</p>

<p>The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.</p>

<p>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.</p>`
    };
  },
  methods: {
    accept() {
      this.$store.commit('acceptLicense');
      this.$router.replace({ name: 'Start' });
    }
  }
};
</script>

<style scoped></style>
