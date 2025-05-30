<template>
  <v-container fluid class="admin-workouts">
    <!-- Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold">Gestión de Entrenamientos</h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              Administra todos los entrenamientos de la plataforma
            </p>
          </div>
          <!-- Desktop create button -->
          <v-btn
            v-if="!$vuetify.display.mobile"
            color="primary"
            size="large"
            @click="openCreateDialog"
            prepend-icon="mdi-plus"
          >
            Crear Entrenamiento
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Mobile FAB -->
    <v-fab
      v-if="$vuetify.display.mobile"
      location="bottom end"
      color="primary"
      icon="mdi-plus"
      @click="openCreateDialog"
      class="mobile-fab"
    ></v-fab>

    <!-- Filters -->
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          label="Buscar entrenamientos"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          clearable
          hide-details
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="difficultyFilter"
          :items="difficulties"
          label="Dificultad"
          variant="outlined"
          clearable
          hide-details
        ></v-select>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="publicFilter"
          :items="publicOptions"
          label="Visibilidad"
          variant="outlined"
          clearable
          hide-details
        ></v-select>
      </v-col>
      <v-col cols="12" md="2">
        <v-btn @click="clearFilters" variant="outlined" block>
          Limpiar
        </v-btn>
      </v-col>
    </v-row>

    <!-- Workouts Grid -->
    <v-row v-if="!adminStore.workoutLoading && filteredWorkouts.length > 0">
      <v-col
        v-for="workout in filteredWorkouts"
        :key="workout.entrenamientoID"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        xl="2"
      >
        <v-card 
          class="workout-card" 
          :elevation="$vuetify.display.mobile ? 1 : 2"
          :class="$vuetify.display.mobile ? 'mobile-workout-card' : ''"
        >
          <v-img
            :src="getWorkoutImage(workout.imagenURL)"
            :height="$vuetify.display.mobile ? 160 : 180"
            cover
            class="workout-image"
            @error="handleImageError"
          >
            <template v-slot:placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </v-row>
            </template>
            <template v-slot:error>
              <v-row class="fill-height ma-0" align="center" justify="center" style="background-color: #f5f5f5;">
                <v-icon size="48" color="grey-lighten-1">mdi-image-off</v-icon>
              </v-row>
            </template>
          </v-img>

          <v-card-title class="workout-title">
            <div class="text-truncate">{{ workout.titulo }}</div>
          </v-card-title>

          <v-card-subtitle class="d-flex align-center justify-space-between flex-wrap">
            <div class="d-flex align-center flex-wrap ga-1">
              <v-chip 
                :color="getDifficultyColor(workout.dificultad)" 
                size="small" 
                class="mr-1 mb-1"
              >
                {{ workout.dificultad }}
              </v-chip>
              <v-chip 
                color="info" 
                size="small"
                class="mb-1"
              >
                {{ workout.duracionMinutos }} min
              </v-chip>
            </div>
            <v-chip
              :color="workout.publico ? 'success' : 'warning'"
              size="small"
              variant="flat"
              class="mb-1"
            >
              {{ workout.publico ? 'Público' : 'Privado' }}
            </v-chip>
          </v-card-subtitle>

          <v-card-text>
            <p class="text-truncate-2">{{ workout.descripcion || 'Sin descripción' }}</p>
            <div class="text-caption text-medium-emphasis mt-2">
              Creado: {{ formatDate(workout.fechaCreacion) }}
            </div>
          </v-card-text>

          <v-card-actions :class="$vuetify.display.mobile ? 'mobile-card-actions' : ''">
            <v-btn
              size="small"
              color="info"
              variant="text"
              :to="`/workouts/${workout.entrenamientoID}`"
              :prepend-icon="$vuetify.display.mobile ? undefined : 'mdi-eye'"
              :icon="$vuetify.display.mobile ? 'mdi-eye' : undefined"
            >
              <span v-if="!$vuetify.display.mobile">Ver</span>
            </v-btn>
            <v-btn
              size="small"
              color="primary"
              variant="text"
              @click="editWorkout(workout)"
              icon="mdi-pencil"
            ></v-btn>
            <v-spacer></v-spacer>
            <v-btn
              size="small"
              color="error"
              variant="text"
              @click="deleteWorkout(workout)"
              icon="mdi-delete"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-else-if="adminStore.workoutLoading" justify="center">
      <v-col cols="12" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-4 text-h6">Cargando entrenamientos...</p>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-row v-else justify="center">
      <v-col cols="12" class="text-center py-8">
        <v-icon size="64" color="grey-lighten-1">mdi-dumbbell-off</v-icon>
        <h3 class="text-h5 mt-4 mb-2">No hay entrenamientos</h3>
        <p class="text-subtitle-1 text-medium-emphasis mb-4">
          Comienza creando el primer entrenamiento
        </p>
        <v-btn color="primary" @click="openCreateDialog" prepend-icon="mdi-plus">
          Crear Entrenamiento
        </v-btn>
      </v-col>
    </v-row>

    <!-- Create/Edit Workout Dialog -->
    <v-dialog 
      v-model="showDialog" 
      :max-width="$vuetify.display.mobile ? '95vw' : '900px'"
      :fullscreen="$vuetify.display.mobile"
      persistent
      scrollable
    >
      <v-card :class="$vuetify.display.mobile ? 'mobile-dialog' : ''">
        <v-card-title class="dialog-title">
          <span>{{ editingWorkout ? 'Editar Entrenamiento' : 'Crear Entrenamiento' }}</span>
          <v-btn 
            v-if="$vuetify.display.mobile"
            icon="mdi-close" 
            variant="text" 
            @click="closeDialog"
            class="close-btn"
          ></v-btn>
        </v-card-title>
        
        <v-card-text :class="$vuetify.display.mobile ? 'px-3' : 'px-6'">
          <v-stepper v-model="currentStep" class="elevation-0 mobile-stepper">
            <v-stepper-header :class="$vuetify.display.mobile ? 'mobile-header' : ''">
              <v-stepper-item 
                :complete="currentStep > 1" 
                :value="1" 
                :title="$vuetify.display.mobile ? 'Info' : 'Información Básica'"
                icon="mdi-information"
                :class="$vuetify.display.mobile ? 'mobile-step' : ''"
              ></v-stepper-item>
              <v-divider :class="$vuetify.display.mobile ? 'mobile-divider' : ''"></v-divider>
              <v-stepper-item 
                :complete="currentStep > 2" 
                :value="2" 
                :title="$vuetify.display.mobile ? 'Ejercicios' : 'Ejercicios'"
                icon="mdi-dumbbell"
                :class="$vuetify.display.mobile ? 'mobile-step' : ''"
              ></v-stepper-item>
              <v-divider :class="$vuetify.display.mobile ? 'mobile-divider' : ''"></v-divider>
              <v-stepper-item 
                :value="3" 
                :title="$vuetify.display.mobile ? 'Revisar' : 'Revisar'"
                icon="mdi-check"
                :class="$vuetify.display.mobile ? 'mobile-step' : ''"
              ></v-stepper-item>
            </v-stepper-header>

            <v-stepper-window>
              <!-- Step 1: Basic Info -->
              <v-stepper-window-item :value="1">
                <v-form ref="basicInfoForm" v-model="basicFormValid">
                  <v-row class="mt-4">
                    <v-col cols="12">
                      <v-text-field
                        v-model="workoutFormData.titulo"
                        label="Título del entrenamiento"
                        :rules="[v => !!v || 'El título es requerido']"
                        variant="outlined"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-textarea
                        v-model="workoutFormData.descripcion"
                        label="Descripción"
                        variant="outlined"
                        rows="3"
                        hint="Describe el entrenamiento y sus objetivos"
                        persistent-hint
                      ></v-textarea>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-select
                        v-model="workoutFormData.dificultad"
                        :items="difficulties"
                        label="Dificultad"
                        :rules="[v => !!v || 'La dificultad es requerida']"
                        variant="outlined"
                        required
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model.number="workoutFormData.duracionMinutos"
                        label="Duración estimada (minutos)"
                        type="number"
                        min="5"
                        max="300"
                        :rules="[
                          v => !!v || 'La duración es requerida',
                          v => v >= 5 || 'Mínimo 5 minutos',
                          v => v <= 300 || 'Máximo 300 minutos'
                        ]"
                        variant="outlined"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-file-input
                        v-model="selectedImage"
                        label="Imagen del entrenamiento"
                        prepend-icon="mdi-camera"
                        variant="outlined"
                        accept="image/*"
                        hint="Sube una imagen representativa del entrenamiento"
                        persistent-hint
                        @change="handleImageChange"
                      ></v-file-input>
                    </v-col>
                    <v-col cols="12">
                      <v-checkbox
                        v-model="workoutFormData.publico"
                        label="Entrenamiento público"
                        color="success"
                        hint="Los entrenamientos públicos son visibles para todos los usuarios"
                        persistent-hint
                      ></v-checkbox>
                    </v-col>
                  </v-row>
                </v-form>
              </v-stepper-window-item>

              <!-- Step 2: Exercises -->
              <v-stepper-window-item :value="2">
                <div class="mt-4">
                  <div class="d-flex align-center justify-space-between mb-4">
                    <h3 class="text-h6">Ejercicios del entrenamiento</h3>
                    <v-btn 
                      color="primary" 
                      @click="openExerciseSelector"
                      prepend-icon="mdi-plus"
                      size="small"
                    >
                      Añadir Ejercicio
                    </v-btn>
                  </div>

                  <!-- Selected Exercises List -->
                  <div v-if="selectedExercises.length === 0" class="text-center py-8">
                    <v-icon size="48" color="grey-lighten-1">mdi-dumbbell-off</v-icon>
                    <p class="text-subtitle-1 text-medium-emphasis mt-2">
                      No has añadido ejercicios al entrenamiento
                    </p>
                    <v-btn color="primary" @click="openExerciseSelector" class="mt-2">
                      Añadir primer ejercicio
                    </v-btn>
                  </div>

                  <v-list v-else>
                    <v-list-item
                      v-for="(exercise, index) in selectedExercises"
                      :key="exercise.ejercicioID"
                      class="exercise-item"
                    >
                      <template v-slot:prepend>
                        <v-avatar size="40">
                          <v-img 
                            :src="getExerciseImage(exercise.imagenURL)"
                            @error="handleImageError"
                          >
                            <template v-slot:error>
                              <v-icon>mdi-dumbbell</v-icon>
                            </template>
                          </v-img>
                        </v-avatar>
                      </template>

                      <v-list-item-title>{{ exercise.nombre }}</v-list-item-title>
                      <v-list-item-subtitle>{{ exercise.grupoMuscular }}</v-list-item-subtitle>

                      <template v-slot:append>
                        <div class="d-flex align-center ga-2">
                          <v-btn
                            size="small"
                            icon="mdi-pencil"
                            color="primary"
                            variant="text"
                            @click="editExerciseDetails(index)"
                          ></v-btn>
                          <v-btn
                            size="small"
                            icon="mdi-delete"
                            color="error"
                            variant="text"
                            @click="removeExercise(index)"
                          ></v-btn>
                        </div>
                      </template>

                      <!-- Exercise details -->
                      <div class="mt-2 ml-4">
                        <v-chip size="small" class="mr-1">{{ exercise.series }} series</v-chip>
                        <v-chip size="small" class="mr-1">{{ exercise.repeticiones }} reps</v-chip>
                        <v-chip size="small">{{ exercise.descansoSegundos }}s descanso</v-chip>
                        <div v-if="exercise.notas" class="text-caption mt-1">
                          Notas: {{ exercise.notas }}
                        </div>
                      </div>
                    </v-list-item>
                  </v-list>
                </div>
              </v-stepper-window-item>

              <!-- Step 3: Review -->
              <v-stepper-window-item :value="3">
                <div class="mt-4">
                  <h3 class="text-h6 mb-4">Revisar entrenamiento</h3>
                  
                  <v-card variant="outlined" class="mb-4">
                    <v-card-title>{{ workoutFormData.titulo }}</v-card-title>
                    <v-card-text>
                      <p>{{ workoutFormData.descripcion || 'Sin descripción' }}</p>
                      <div class="d-flex align-center gap-2 mt-2">
                        <v-chip :color="getDifficultyColor(workoutFormData.dificultad)" size="small">
                          {{ workoutFormData.dificultad }}
                        </v-chip>
                        <v-chip color="info" size="small">{{ workoutFormData.duracionMinutos }} min</v-chip>
                        <v-chip :color="workoutFormData.publico ? 'success' : 'warning'" size="small">
                          {{ workoutFormData.publico ? 'Público' : 'Privado' }}
                        </v-chip>
                      </div>
                    </v-card-text>
                  </v-card>

                  <v-card variant="outlined">
                    <v-card-title>Ejercicios ({{ selectedExercises.length }})</v-card-title>
                    <v-card-text>
                      <div v-if="selectedExercises.length === 0" class="text-center py-4">
                        <p class="text-medium-emphasis">No se han añadido ejercicios</p>
                      </div>
                      <v-list v-else density="compact">
                        <v-list-item
                          v-for="(exercise, index) in selectedExercises"
                          :key="exercise.ejercicioID"
                        >
                          <v-list-item-title>{{ index + 1 }}. {{ exercise.nombre }}</v-list-item-title>
                          <v-list-item-subtitle>
                            {{ exercise.series }}x{{ exercise.repeticiones }} - {{ exercise.descansoSegundos }}s
                          </v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </div>
              </v-stepper-window-item>
            </v-stepper-window>
          </v-stepper>
        </v-card-text>

        <v-card-actions :class="$vuetify.display.mobile ? 'mobile-actions px-3 pb-3' : 'px-6 pb-4'">
          <v-btn 
            v-if="!$vuetify.display.mobile"
            @click="closeDialog" 
            variant="text"
          >
            Cancelar
          </v-btn>
          <v-spacer v-if="!$vuetify.display.mobile"></v-spacer>
          
          <!-- Mobile layout - full width buttons -->
          <div v-if="$vuetify.display.mobile" class="mobile-button-container">
            <v-btn
              v-if="currentStep > 1"
              @click="currentStep--"
              variant="outlined"
              block
              class="mb-2"
            >
              <v-icon start>mdi-arrow-left</v-icon>
              Anterior
            </v-btn>
            
            <v-btn
              v-if="currentStep < 3"
              @click="nextStep"
              color="primary"
              :disabled="!canProceed"
              block
              class="mb-2"
            >
              Siguiente
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
            
            <v-btn
              v-if="currentStep === 3"
              @click="saveWorkout"
              color="primary"
              :loading="adminStore.loading"
              :disabled="!canSave || adminStore.loading"
              block
              class="mb-2"
            >
              <v-icon start>mdi-check</v-icon>
              {{ editingWorkout ? 'Actualizar' : 'Crear' }} Entrenamiento
            </v-btn>
            
            <v-btn
              @click="closeDialog"
              variant="outlined"
              block
            >
              <v-icon start>mdi-close</v-icon>
              Cancelar
            </v-btn>
          </div>

          <!-- Desktop layout -->
          <template v-else>
            <v-btn
              v-if="currentStep > 1"
              @click="currentStep--"
              variant="outlined"
            >
              Anterior
            </v-btn>
            
            <v-btn
              v-if="currentStep < 3"
              @click="nextStep"
              color="primary"
              :disabled="!canProceed"
            >
              Siguiente
            </v-btn>
            
            <v-btn
              v-if="currentStep === 3"
              @click="saveWorkout"
              color="primary"
              :loading="adminStore.loading"
              :disabled="!canSave || adminStore.loading"
            >
              {{ editingWorkout ? 'Actualizar' : 'Crear' }} Entrenamiento
            </v-btn>
          </template>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Exercise Selector Dialog -->
    <v-dialog 
      v-model="showExerciseSelector" 
      :max-width="$vuetify.display.mobile ? '95vw' : '800px'"
      :fullscreen="$vuetify.display.mobile"
      scrollable
    >
      <v-card :class="$vuetify.display.mobile ? 'mobile-dialog' : ''">
        <v-card-title class="dialog-title">
          <span>Seleccionar Ejercicio</span>
          <v-btn 
            v-if="$vuetify.display.mobile"
            icon="mdi-close" 
            variant="text" 
            @click="cancelExerciseSelector"
            class="close-btn"
          ></v-btn>
        </v-card-title>
        <v-card-text :class="$vuetify.display.mobile ? 'px-3' : ''">
          <!-- Search exercises -->
          <v-text-field
            v-model="exerciseSearch"
            label="Buscar ejercicios"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            clearable
            class="mb-4"
          ></v-text-field>

          <!-- Exercises list -->
          <v-list 
            :max-height="$vuetify.display.mobile ? 'calc(100vh - 200px)' : '400px'" 
            class="overflow-y-auto"
          >
            <v-list-item
              v-for="exercise in filteredAvailableExercises"
              :key="exercise.ejercicioID"
              @click="selectExercise(exercise)"
              class="cursor-pointer exercise-list-item"
              :class="$vuetify.display.mobile ? 'mobile-exercise-item' : ''"
            >
              <template v-slot:prepend>
                <v-avatar :size="$vuetify.display.mobile ? 48 : 40">
                  <v-img 
                    :src="getExerciseImage(exercise.imagenURL)"
                    @error="handleImageError"
                  >
                    <template v-slot:error>
                      <v-icon>mdi-dumbbell</v-icon>
                    </template>
                  </v-img>
                </v-avatar>
              </template>
              <v-list-item-title :class="$vuetify.display.mobile ? 'mobile-title' : ''">
                {{ exercise.nombre }}
              </v-list-item-title>
              <v-list-item-subtitle :class="$vuetify.display.mobile ? 'mobile-subtitle' : ''">
                {{ exercise.grupoMuscular }}
              </v-list-item-subtitle>
              <template v-if="$vuetify.display.mobile" v-slot:append>
                <v-icon color="primary">mdi-chevron-right</v-icon>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions v-if="!$vuetify.display.mobile">
          <v-spacer></v-spacer>
          <v-btn @click="cancelExerciseSelector" variant="text">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Exercise Details Dialog -->
    <v-dialog 
      v-model="showExerciseDetails" 
      :max-width="$vuetify.display.mobile ? '95vw' : '500px'"
      :fullscreen="$vuetify.display.mobile"
      scrollable
    >
      <v-card :class="$vuetify.display.mobile ? 'mobile-dialog' : ''">
        <v-card-title class="dialog-title">
          <span>Configurar Ejercicio</span>
          <v-btn 
            v-if="$vuetify.display.mobile"
            icon="mdi-close" 
            variant="text" 
            @click="cancelExerciseDetails"
            class="close-btn"
          ></v-btn>
        </v-card-title>
        <v-card-text :class="$vuetify.display.mobile ? 'px-3' : ''">
          <v-form ref="exerciseDetailsForm" v-model="exerciseDetailsValid">
            <v-row>
              <v-col :cols="$vuetify.display.mobile ? 12 : 6">
                <v-text-field
                  v-model.number="exerciseDetails.series"
                  label="Series"
                  type="number"
                  min="1"
                  max="10"
                  :rules="[v => !!v && v > 0 || 'Mínimo 1 serie']"
                  variant="outlined"
                  prepend-inner-icon="mdi-counter"
                ></v-text-field>
              </v-col>
              <v-col :cols="$vuetify.display.mobile ? 12 : 6">
                <v-text-field
                  v-model.number="exerciseDetails.repeticiones"
                  label="Repeticiones"
                  type="number"
                  min="1"
                  max="100"
                  :rules="[v => !!v && v > 0 || 'Mínimo 1 repetición']"
                  variant="outlined"
                  prepend-inner-icon="mdi-repeat"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model.number="exerciseDetails.descansoSegundos"
                  label="Descanso (segundos)"
                  type="number"
                  min="10"
                  max="300"
                  :rules="[v => !!v && v >= 10 || 'Mínimo 10 segundos']"
                  variant="outlined"
                  prepend-inner-icon="mdi-timer"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="exerciseDetails.notas"
                  label="Notas (opcional)"
                  variant="outlined"
                  rows="2"
                  prepend-inner-icon="mdi-note-text"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions :class="$vuetify.display.mobile ? 'mobile-actions px-3 pb-3' : ''">
          <div v-if="$vuetify.display.mobile" class="mobile-button-container">
            <v-btn 
              @click="saveExerciseDetails" 
              color="primary"
              :disabled="!exerciseDetailsValid"
              block
              class="mb-2"
            >
              <v-icon start>mdi-check</v-icon>
              Guardar
            </v-btn>
            <v-btn @click="cancelExerciseDetails" variant="outlined" block>
              <v-icon start>mdi-close</v-icon>
              Cancelar
            </v-btn>
          </div>
          <template v-else>
            <v-spacer></v-spacer>
            <v-btn @click="cancelExerciseDetails" variant="text">Cancelar</v-btn>
            <v-btn 
              @click="saveExerciseDetails" 
              color="primary"
              :disabled="!exerciseDetailsValid"
            >
              Guardar
            </v-btn>
          </template>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas eliminar el entrenamiento <strong>{{ workoutToDelete?.titulo }}</strong>?
          Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showDeleteDialog = false" variant="text">Cancelar</v-btn>
          <v-btn
            @click="confirmDelete"
            color="error"
            :loading="adminStore.loading"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success notification with instructions -->
    <v-snackbar 
      v-model="showSuccessNotification" 
      :timeout="5000"
      color="success"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon start>mdi-check-circle</v-icon>
        <div>
          <div class="font-weight-medium">¡Entrenamiento creado exitosamente!</div>
          <div class="text-caption">Puedes verlo en la lista principal</div>
        </div>
      </div>
      <template v-slot:actions>
        <v-btn variant="text" @click="showSuccessNotification = false">
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="showSnackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn variant="text" @click="showSnackbar = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore, type AdminWorkout, type AdminExercise } from '@/stores/admin'

const adminStore = useAdminStore()

// Reactive data
const search = ref('')
const difficultyFilter = ref(null)
const publicFilter = ref(null)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const editingWorkout = ref<AdminWorkout | null>(null)
const workoutToDelete = ref<AdminWorkout | null>(null)
const basicFormValid = ref(false)
const basicInfoForm = ref()

// Stepper
const currentStep = ref(1)

// Exercise selection
const showExerciseSelector = ref(false)
const showExerciseDetails = ref(false)
const exerciseSearch = ref('')
const selectedExercises = ref<any[]>([])
const availableExercises = ref<AdminExercise[]>([])
const exerciseDetails = ref({
  series: 3,
  repeticiones: 12,
  descansoSegundos: 60,
  notas: ''
})
const exerciseDetailsValid = ref(false)
const exerciseDetailsForm = ref()
const editingExerciseIndex = ref(-1)
const tempSelectedExercise = ref<AdminExercise | null>(null)

// Image handling
const selectedImage = ref<File[]>([])

// Snackbar
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')
const showSuccessNotification = ref(false)

// Form data
const workoutFormData = ref({
  titulo: '',
  descripcion: '',
  dificultad: '',
  duracionMinutos: 30,
  publico: true,
})

// Filter options
const difficulties = ['Fácil', 'Media', 'Difícil']

const publicOptions = [
  { title: 'Públicos', value: true },
  { title: 'Privados', value: false }
]

// Computed
const filteredWorkouts = computed(() => {
  let workouts = adminStore.workouts

  if (search.value) {
    workouts = workouts.filter(workout =>
      workout.titulo.toLowerCase().includes(search.value.toLowerCase()) ||
      workout.descripcion.toLowerCase().includes(search.value.toLowerCase())
    )
  }

  if (difficultyFilter.value) {
    workouts = workouts.filter(workout => workout.dificultad === difficultyFilter.value)
  }

  if (publicFilter.value !== null) {
    workouts = workouts.filter(workout => workout.publico === publicFilter.value)
  }

  return workouts
})

const filteredAvailableExercises = computed(() => {
  let exercises = availableExercises.value

  if (exerciseSearch.value) {
    exercises = exercises.filter(exercise =>
      exercise.nombre.toLowerCase().includes(exerciseSearch.value.toLowerCase()) ||
      (exercise.grupoMuscular && exercise.grupoMuscular.toLowerCase().includes(exerciseSearch.value.toLowerCase()))
    )
  }

  // Filter out already selected exercises
  const selectedIds = selectedExercises.value.map(e => e.ejercicioID)
  return exercises.filter(e => !selectedIds.includes(e.ejercicioID))
})

const canProceed = computed(() => {
  if (currentStep.value === 1) {
    return basicFormValid.value
  }
  return true
})

const canSave = computed(() => {
  return basicFormValid.value
})

// Methods
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Fácil': return 'success'
    case 'Media': return 'warning'
    case 'Difícil': return 'error'
    default: return 'primary'
  }
}

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('es-ES')
}

const clearFilters = () => {
  search.value = ''
  difficultyFilter.value = null
  publicFilter.value = null
}

const openCreateDialog = () => {
  editingWorkout.value = null
  currentStep.value = 1
  selectedExercises.value = []
  selectedImage.value = []
  tempSelectedExercise.value = null
  editingExerciseIndex.value = -1
  
  workoutFormData.value = {
    titulo: '',
    descripcion: '',
    dificultad: '',
    duracionMinutos: 30,
    publico: true,
  }
  
  // Reset exercise details
  exerciseDetails.value = {
    series: 3,
    repeticiones: 12,
    descansoSegundos: 60,
    notas: ''
  }
  
  showDialog.value = true
  console.log('📝 Diálogo de crear entrenamiento abierto')
}

const editWorkout = (workout: AdminWorkout) => {
  editingWorkout.value = workout
  currentStep.value = 1
  selectedExercises.value = []
  selectedImage.value = []
  workoutFormData.value = {
    titulo: workout.titulo,
    descripcion: workout.descripcion,
    dificultad: workout.dificultad,
    duracionMinutos: workout.duracionMinutos,
    publico: workout.publico,
  }
  showDialog.value = true
  // TODO: Load existing exercises for this workout
}

const closeDialog = () => {
  showDialog.value = false
  editingWorkout.value = null
  currentStep.value = 1
  selectedExercises.value = []
  selectedImage.value = []
}

const nextStep = async () => {
  if (currentStep.value === 1) {
    const isValid = await basicInfoForm.value?.validate()
    if (isValid?.valid) {
      currentStep.value++
    }
  } else {
    currentStep.value++
  }
}

const handleImageChange = () => {
  // Handle image selection
}

const openExerciseSelector = async () => {
  if (availableExercises.value.length === 0) {
    await adminStore.fetchExercises()
    availableExercises.value = adminStore.exercises
  }
  exerciseSearch.value = ''
  showExerciseSelector.value = true
}

const selectExercise = (exercise: AdminExercise) => {
  // Reset exercise details
  exerciseDetails.value = {
    series: 3,
    repeticiones: 12,
    descansoSegundos: 60,
    notas: ''
  }
  editingExerciseIndex.value = -1
  
  // Store the selected exercise temporarily using reactive ref
  tempSelectedExercise.value = { ...exercise }
  showExerciseSelector.value = false
  showExerciseDetails.value = true
}

const editExerciseDetails = (index: number) => {
  const exercise = selectedExercises.value[index]
  exerciseDetails.value = {
    series: exercise.series,
    repeticiones: exercise.repeticiones,
    descansoSegundos: exercise.descansoSegundos,
    notas: exercise.notas || ''
  }
  editingExerciseIndex.value = index
  showExerciseDetails.value = true
}

const saveExerciseDetails = async () => {
  // Validate form first
  if (exerciseDetailsForm.value) {
    const validation = await exerciseDetailsForm.value.validate()
    if (!validation.valid) {
      console.log('❌ Formulario de ejercicio no válido')
      return
    }
  }

  try {
    if (editingExerciseIndex.value >= 0) {
      // Update existing exercise
      const exercise = selectedExercises.value[editingExerciseIndex.value]
      Object.assign(exercise, exerciseDetails.value)
      console.log('✅ Ejercicio actualizado:', exercise)
    } else {
      // Add new exercise
      if (!tempSelectedExercise.value) {
        console.error('❌ No hay ejercicio temporal seleccionado')
        showNotification('Error: No se encontró el ejercicio seleccionado', 'error')
        return
      }

      const exercise = {
        ...tempSelectedExercise.value,
        ...exerciseDetails.value
      }
      selectedExercises.value.push(exercise)
      console.log('✅ Ejercicio añadido:', exercise)
      console.log('📋 Lista actual de ejercicios:', selectedExercises.value)
    }
    
    showExerciseDetails.value = false
    editingExerciseIndex.value = -1
    tempSelectedExercise.value = null
    
    // Show success notification
    showNotification('Ejercicio configurado correctamente', 'success')
    
  } catch (error) {
    console.error('❌ Error al guardar ejercicio:', error)
    showNotification('Error al configurar ejercicio', 'error')
  }
}

const cancelExerciseDetails = () => {
  showExerciseDetails.value = false
  editingExerciseIndex.value = -1
  tempSelectedExercise.value = null
  
  // Reset exercise details
  exerciseDetails.value = {
    series: 3,
    repeticiones: 12,
    descansoSegundos: 60,
    notas: ''
  }
  
  console.log('❌ Configuración de ejercicio cancelada')
}

const cancelExerciseSelector = () => {
  showExerciseSelector.value = false
  exerciseSearch.value = ''
  console.log('❌ Selector de ejercicio cancelado')
}

const removeExercise = (index: number) => {
  selectedExercises.value.splice(index, 1)
}

const saveWorkout = async () => {
  // Prevenir múltiples envíos
  if (adminStore.loading) {
    console.log('⏳ Ya se está guardando un entrenamiento, esperando...')
    return
  }

  try {
    console.log('🔥 Iniciando guardado de entrenamiento...')
    console.log('📋 Ejercicios seleccionados:', selectedExercises.value)
    
    // Create FormData
    const formData = new FormData()
    
    // Add basic workout data
    formData.append('Titulo', workoutFormData.value.titulo)
    formData.append('Descripcion', workoutFormData.value.descripcion || '')
    formData.append('DuracionMinutos', workoutFormData.value.duracionMinutos.toString())
    formData.append('Dificultad', workoutFormData.value.dificultad)
    formData.append('Publico', workoutFormData.value.publico.toString())
    
    // Add image if selected and valid
    if (selectedImage.value && selectedImage.value.length > 0 && selectedImage.value[0]) {
      const imageFile = selectedImage.value[0]
      
      // Validate image before sending
      if (imageFile.size > 5 * 1024 * 1024) { // 5MB limit
        showNotification('La imagen es demasiado grande (máximo 5MB)', 'error')
        return
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      if (!validTypes.includes(imageFile.type)) {
        showNotification('Formato de imagen no válido (use JPG, PNG, WebP o GIF)', 'error')
        return
      }
      
      formData.append('Imagen', imageFile)
      console.log('🖼️ Imagen válida agregada:', imageFile.name, `(${(imageFile.size / 1024 / 1024).toFixed(2)}MB)`)
    } else {
      console.log('📝 Sin imagen seleccionada')
    }
    
    // Add exercises
    if (selectedExercises.value.length === 0) {
      console.log('⚠️ Advertencia: Creando entrenamiento sin ejercicios')
    }
    
    selectedExercises.value.forEach((exercise, index) => {
      console.log(`➕ Agregando ejercicio ${index + 1}:`, exercise.nombre)
      formData.append(`Ejercicios[${index}].EjercicioID`, exercise.ejercicioID.toString())
      formData.append(`Ejercicios[${index}].Series`, exercise.series.toString())
      formData.append(`Ejercicios[${index}].Repeticiones`, exercise.repeticiones.toString())
      formData.append(`Ejercicios[${index}].DescansoSegundos`, exercise.descansoSegundos.toString())
      if (exercise.notas && exercise.notas.trim()) {
        formData.append(`Ejercicios[${index}].Notas`, exercise.notas.trim())
      }
    })

    console.log('📤 FormData construido, enviando al servidor...')
    
    // Log FormData contents for debug (only in development)
    if (import.meta.env.DEV) {
      console.log('📝 Contenido del FormData:')
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: [File] ${value.name} (${value.type})`)
        } else {
          console.log(`  ${key}: ${value}`)
        }
      }
    }

    let success = false
    if (editingWorkout.value) {
      success = await adminStore.updateWorkout(editingWorkout.value.entrenamientoID, formData)
      // No mostrar notificación aquí, se maneja abajo
    } else {
      success = await adminStore.createWorkout(formData)
      // No mostrar notificación aquí, se maneja abajo
    }
    
    if (success) {
      console.log('✅ Entrenamiento guardado exitosamente')
      
      // Mostrar notificación especial de éxito
      if (editingWorkout.value) {
        showNotification('Entrenamiento actualizado correctamente', 'success')
      } else {
        showSuccessNotification.value = true
      }
      
      // Esperar un poco antes de cerrar para que el usuario vea la notificación
      setTimeout(() => {
        closeDialog()
      }, 1500)
    }
    
  } catch (error) {
    console.error('❌ Error al guardar entrenamiento:', error)
    
    // Manejar diferentes tipos de errores
    let errorMessage = 'Error al guardar entrenamiento'
    
    if (error instanceof Error) {
      if (error.message.includes('400')) {
        errorMessage = 'Datos del formulario inválidos. Revise todos los campos.'
      } else if (error.message.includes('401')) {
        errorMessage = 'No autorizado. Por favor, inicie sesión nuevamente.'
      } else if (error.message.includes('413')) {
        errorMessage = 'La imagen es demasiado grande. Reduzca el tamaño.'
      } else if (error.message.includes('500')) {
        errorMessage = 'Error del servidor. Inténtelo más tarde.'
      } else {
        errorMessage = error.message
      }
    }
    
    showNotification(errorMessage, 'error')
  }
}

const deleteWorkout = (workout: AdminWorkout) => {
  workoutToDelete.value = workout
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!workoutToDelete.value) return

  try {
    await adminStore.deleteWorkout(workoutToDelete.value.entrenamientoID)
    showNotification('Entrenamiento eliminado correctamente', 'success')
    showDeleteDialog.value = false
    workoutToDelete.value = null
  } catch (error) {
    showNotification(adminStore.error || 'Error al eliminar entrenamiento', 'error')
  }
}

const showNotification = (message: string, color: string) => {
  snackbarMessage.value = message
  snackbarColor.value = color
  showSnackbar.value = true
}

// Helper para manejar imágenes
// Helper para manejar imágenes
const getWorkoutImage = (imageUrl?: string): string => {
  if (!imageUrl) {
    // Imagen por defecto usando un servicio confiable
    return 'https://via.placeholder.com/400x200/1976D2/FFFFFF?text=Entrenamiento'
  }
  
  // Si la URL parece ser válida, usarla
  if (imageUrl.startsWith('http')) {
    return imageUrl
  }
  
  // Si es una URL relativa, construir la URL completa
  if (imageUrl.startsWith('/')) {
    return `${API_URL}${imageUrl}`
  }
  
  // Fallback
  return 'https://via.placeholder.com/400x200/1976D2/FFFFFF?text=Entrenamiento'
}

const getExerciseImage = (imageUrl?: string): string => {
  if (!imageUrl) {
    // Imagen por defecto para ejercicios
    return 'https://via.placeholder.com/80x80/424242/FFFFFF?text=💪'
  }
  
  // Si la URL parece ser válida, usarla
  if (imageUrl.startsWith('http')) {
    return imageUrl
  }
  
  // Si es una URL relativa, construir la URL completa
  if (imageUrl.startsWith('/')) {
    return `${API_URL}${imageUrl}`
  }
  
  // Fallback
  return 'https://via.placeholder.com/80x80/424242/FFFFFF?text=💪'
}

const handleImageError = (event: Event) => {
  console.log('❌ Error cargando imagen:', event)
  const img = event.target as HTMLImageElement
  if (img) {
    // Cambiar a imagen por defecto si falla
    img.src = 'https://via.placeholder.com/400x200/1976D2/FFFFFF?text=Sin%20Imagen'
  }
}

// Lifecycle
onMounted(() => {
  adminStore.fetchWorkouts()
})
</script>

<style scoped>
.admin-workouts {
  padding: 16px;
}

/* Mobile First - Base styles for mobile */
@media (max-width: 600px) {
  .admin-workouts {
    padding: 8px;
  }
  
  .text-h4 {
    font-size: 1.25rem !important;
    line-height: 1.5;
  }
  
  .text-subtitle-1 {
    font-size: 0.875rem !important;
  }
  
  /* Mobile dialog styles */
  .mobile-dialog {
    height: 100vh;
    margin: 0;
    border-radius: 0 !important;
  }
  
  .dialog-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: #1976D2;
    color: white;
    position: sticky;
    top: 0;
    z-index: 1;
  }
  
  .close-btn {
    margin-left: auto;
  }
  
  /* Mobile stepper styles */
  .mobile-stepper .v-stepper-header {
    padding: 8px;
    box-shadow: none;
  }
  
  .mobile-step {
    min-width: 0;
    flex: 1;
  }
  
  .mobile-step .v-stepper-item__title {
    font-size: 0.75rem;
    line-height: 1.2;
  }
  
  .mobile-divider {
    margin: 0 4px;
  }
  
  /* Mobile button container */
  .mobile-button-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .mobile-actions {
    padding: 12px 16px 16px;
    background-color: #f5f5f5;
  }
  
  /* Exercise list mobile styles */
  .mobile-exercise-item {
    padding: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }
  
  .mobile-title {
    font-size: 1rem;
    font-weight: 500;
  }
  
  .mobile-subtitle {
    font-size: 0.875rem;
    margin-top: 4px;
  }
  
  /* Mobile grid adjustments */
  .v-col {
    padding: 4px;
  }
  
  /* Mobile form fields */
  .v-text-field,
  .v-select,
  .v-textarea,
  .v-file-input {
    margin-bottom: 8px;
  }
  
  /* Mobile cards in grid */
  .workout-card {
    margin-bottom: 12px;
  }
  
  .mobile-workout-card {
    border-radius: 12px;
    overflow: hidden;
  }
  
  .mobile-workout-card .workout-title {
    font-size: 1rem;
    padding: 12px;
  }
  
  .mobile-workout-card .v-card-subtitle {
    padding: 0 12px 8px;
    font-size: 0.75rem;
  }
  
  .mobile-workout-card .v-card-text {
    padding: 8px 12px;
  }
  
  .mobile-card-actions {
    padding: 8px 12px 12px;
    justify-content: space-around;
  }
  
  .mobile-card-actions .v-btn {
    min-width: 40px;
  }
  
  /* Mobile chips */
  .v-chip {
    font-size: 0.75rem;
    height: 24px;
  }
  
  /* Mobile filter row */
  .v-row.mb-4 {
    margin-bottom: 8px !important;
  }
  
  /* Mobile exercise item in list */
  .exercise-item {
    padding: 12px;
    margin-bottom: 8px;
    border-radius: 8px;
  }
  
  /* Mobile fab for adding */
  .mobile-fab {
    z-index: 100 !important;
  }
  
  .v-fab {
    box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12);
  }
}

/* Tablet styles */
@media (min-width: 601px) and (max-width: 960px) {
  .admin-workouts {
    padding: 12px;
  }
  
  .workout-card {
    height: 100%;
    min-height: 350px;
  }
}

/* Desktop styles */
@media (min-width: 961px) {
  .workout-card {
    height: 100%;
    transition: transform 0.2s ease-in-out;
  }

  .workout-card:hover {
    transform: translateY(-4px);
  }
}

/* Common styles for all screen sizes */
.workout-image {
  border-radius: 4px 4px 0 0;
}

.workout-title {
  background-color: #1976D2;
  color: white;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  max-height: calc(1.4em * 2);
}

.exercise-item {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  margin-bottom: 8px;
  padding: 8px;
}

.exercise-list-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.exercise-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

/* Loading and empty states */
.v-progress-circular {
  margin: 0 auto;
}

/* Form validation states */
.v-messages {
  min-height: 12px;
}

/* Consistent spacing */
.v-stepper-window-item {
  padding: 16px 0;
}

/* Image preview styles */
.image-preview {
  max-width: 200px;
  max-height: 150px;
  border-radius: 8px;
  margin-top: 8px;
}

/* Accessibility improvements */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus states for better accessibility */
.v-btn:focus,
.v-text-field:focus-within,
.v-select:focus-within {
  outline: 2px solid #1976D2;
  outline-offset: 2px;
}

/* Dark mode support */
.v-theme--dark .exercise-item {
  border-color: rgba(255, 255, 255, 0.12);
}

.v-theme--dark .mobile-actions {
  background-color: #212121;
}

.v-theme--dark .dialog-title {
  background-color: #1976D2;
}

/* Animation classes */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Utility classes */
.cursor-pointer {
  cursor: pointer;
}

.full-width {
  width: 100%;
}

/* Print styles */
@media print {
  .admin-workouts {
    padding: 0;
  }
  
  .v-btn {
    display: none;
  }
  
  .workout-card {
    break-inside: avoid;
    margin-bottom: 16px;
  }
}
</style>