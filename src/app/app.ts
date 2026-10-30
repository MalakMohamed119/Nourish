import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FOOD_EXTRAS } from './food-catalog';

type Tab = 'dashboard' | 'diary' | 'foods' | 'planner' | 'history';
type Category = 'Bakery' | 'Dairy' | 'Meat' | 'Produce' | 'Snacks' | 'Other' | 'Protein' | 'Grains & legumes' | 'Vegetables' | 'Fruits' | 'Nuts & seeds' | 'Sauces & extras' | 'Egyptian ingredients' | 'Drinks' | 'Homemade recipes';
export interface RecipeIngredient { foodId: string; grams: number; }
type Meal = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
type Activity = 'low' | 'light' | 'moderate' | 'high';
type Goal = 'maintain' | 'lose' | 'gain';
export interface Food { id: string; name: string; nameAr?: string; nameEn?: string; category: Category; caloriesPer100g: number; kcal?: number; protein: number | null; carbs: number | null; fat: number | null; portionGrams: number; portionLabel: string; brand?: string; preparationState?: string; sourceType?: 'user-supplied-estimate' | 'reference-estimate' | 'food-label' | 'usda' | 'homemade-recipe'; sourceUrl?: string | null; isVerified?: boolean; ingredients?: RecipeIngredient[]; cookedWeightGrams?: number; }
interface Item { id: string; foodId: string; grams: number; meal: Meal; }
interface PlannedFood { foodId: string; grams: number; }
interface WorkoutSet { reps: number; weightKg: number; }
interface Workout { id: string; exercise: string; sets: WorkoutSet[]; }
interface Profile { name: string; age: number; sex: 'female' | 'male'; heightCm: number; weightKg: number; activity: Activity; goal: Goal; preferences: string; }
type ProfileDraft = Omit<Profile,'age'|'heightCm'|'weightKg'|'sex'|'activity'|'goal'> & {age:number|null;heightCm:number|null;weightKg:number|null;sex:Profile['sex']|'';activity:Activity|'';goal:Goal|''};
interface SavedData { profile?: Profile | null; customFoods: Food[]; diary: Record<string, Item[]>; water: Record<string, number>; plannerMeals: number; workouts?: Record<string, Workout[]>; }

// Generic foods from the original starter list; brand-specific values belong in custom foods.
type LegacyCatalogFood = Omit<Food,'caloriesPer100g'> & { kcal: number; caloriesPer100g?: number; };
const BUILT_INS: LegacyCatalogFood[] = [
  {id:'toast',name:'Brown toast',category:'Bakery',kcal:250,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'white-toast',name:'White toast',category:'Bakery',kcal:265,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'baladi-bread',name:'Baladi bread',category:'Bakery',kcal:270,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'pita-bread',name:'Pita bread',category:'Bakery',kcal:275,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'cheddar-slices',name:'Cheddar cheese slices',category:'Dairy',kcal:400,protein:25,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'cheddar',name:'Spreadable cheddar',category:'Dairy',kcal:280,protein:10,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'cottage',name:'Cottage cheese',category:'Dairy',kcal:98,protein:17,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'low-salt-white-cheese',name:'Low-salt white cheese',category:'Dairy',kcal:200,protein:12,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'triangle-cheese',name:'Processed cheese triangles',category:'Dairy',kcal:270,protein:9,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'turkey',name:'Smoked turkey slices',category:'Meat',kcal:110,protein:20,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'salami',name:'Beef salami',category:'Meat',kcal:380,protein:22,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'beef-luncheon',name:'Beef luncheon',category:'Meat',kcal:250,protein:12,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'basturma',name:'Basturma',category:'Meat',kcal:180,protein:30,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'cooked-rice',name:'Cooked white rice',category:'Other',kcal:130,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'raw-rice',name:'Uncooked white rice',category:'Other',kcal:360,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'cooked-pasta',name:'Cooked pasta',category:'Other',kcal:155,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'raw-pasta',name:'Uncooked pasta',category:'Other',kcal:350,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'boiled-potato',name:'Boiled potato',category:'Produce',kcal:87,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'mashed-potato',name:'Plain mashed potato',category:'Produce',kcal:87,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'raw-lentils',name:'Uncooked lentils',category:'Other',kcal:350,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'raw-chicken',name:'Raw skinless chicken breast',category:'Meat',kcal:120,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'chicken',name:'Cooked chicken breast, no oil',category:'Meat',kcal:165,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'tuna-water',name:'Drained tuna in water',category:'Meat',kcal:116,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'tuna-oil',name:'Drained tuna in oil',category:'Meat',kcal:190,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'lean-beef',name:'Lean raw beef',category:'Meat',kcal:175,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'ground-beef',name:'Raw ground beef 80/20',category:'Meat',kcal:254,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'beef-burger',name:'Homemade beef burger, plain',category:'Meat',kcal:250,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'nutella',name:'Chocolate hazelnut spread',category:'Snacks',kcal:539,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'honey',name:'Honey',category:'Snacks',kcal:304,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'sugar',name:'White sugar',category:'Other',kcal:400,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'oil',name:'Olive oil',category:'Other',kcal:884,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'vegetable-oil',name:'Vegetable oil',category:'Other',kcal:884,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'ghee',name:'Ghee',category:'Dairy',kcal:900,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'butter',name:'Butter',category:'Dairy',kcal:717,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'mayonnaise',name:'Mayonnaise',category:'Other',kcal:680,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'ketchup',name:'Ketchup',category:'Other',kcal:110,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'grapes',name:'Grapes',category:'Produce',kcal:69,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'plum',name:'Plum',category:'Produce',kcal:46,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'apple',name:'Apple',category:'Produce',kcal:52,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'mango',name:'Mango',category:'Produce',kcal:60,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'strawberry',name:'Strawberries',category:'Produce',kcal:32,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'dates',name:'Dates',category:'Produce',kcal:277,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'tomato',name:'Tomatoes',category:'Produce',kcal:18,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'cucumber',name:'Cucumber',category:'Produce',kcal:15,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'onion',name:'Onion',category:'Produce',kcal:40,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'zucchini',name:'Zucchini',category:'Produce',kcal:17,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'},
  {id:'lemon',name:'Lemon',category:'Produce',kcal:29,protein:null,carbs:null,fat:null,portionGrams:1,portionLabel:'g'}
];
const EXTRA_IDS=new Set(FOOD_EXTRAS.map(food=>food.id));
const USER_SUPPLIED_IDS=new Set(['raw-chicken','cooked-rice','cheddar-slices','turkey','ground-beef']);
const STORAGE_KEY='nourish-personal-v2';

@Component({selector:'app-root',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./app.html',styleUrl:'./app.css'})
export class App {
  readonly Math=Math;
  tab=signal<Tab>('dashboard'); query=signal(''); category=signal('All'); selectedDate=signal(this.todayKey()); activeMeal=signal<Meal>('Breakfast'); showFoodForm=signal(false); editProfile=signal(false);
  profile=signal<Profile|null>(null); customFoods=signal<Food[]>([]); diary=signal<Record<string,Item[]>>({}); waterByDate=signal<Record<string,number>>({}); workoutsByDate=signal<Record<string,Workout[]>>({}); plannerMeals=signal(3); foodKind:'single'|'recipe'='single'; recipeIngredients:RecipeIngredient[]=[{foodId:'',grams:100}]; recipeCookedWeight=100; waterInput=250; exerciseName=''; exerciseSets:WorkoutSet[]=[{reps:10,weightKg:0}];
  profileForm:ProfileDraft={name:'',age:null,sex:'',heightCm:null,weightKg:null,activity:'',goal:'',preferences:''};
  newFood:Partial<Food>={category:'Other',caloriesPer100g:0,name:''};
  foods=computed(()=>[...this.customFoods().map(f=>({...f,portionGrams:f.portionGrams||100,portionLabel:f.portionLabel||'100 g'})),...BUILT_INS.filter(f=>!EXTRA_IDS.has(f.id)),...FOOD_EXTRAS].map(f=>({...f,caloriesPer100g:f.caloriesPer100g??f.kcal??0,nameEn:f.nameEn??f.name,nameAr:f.nameAr??({ 'raw-chicken':'صدور فراخ نيّة','cooked-rice':'رز أبيض مطبوخ','cheddar-slices':'شيدر شرائح','turkey':'تركي مدخن','ground-beef':'لحم بقري مفروم 80/20 نيّ' } as Record<string,string>)[f.id]??'',sourceType:f.sourceType??(USER_SUPPLIED_IDS.has(f.id)?'user-supplied-estimate':'reference-estimate'),sourceUrl:f.sourceUrl===undefined&&(f.sourceType??(USER_SUPPLIED_IDS.has(f.id)?'user-supplied-estimate':'reference-estimate'))==='reference-estimate'?'https://fdc.nal.usda.gov/food-search/?query='+encodeURIComponent(f.nameEn??f.name):f.sourceUrl??null,isVerified:f.isVerified??false})));
  foodCategories=computed(()=>['All',...Array.from(new Set(this.foods().map(food=>food.category))).sort()]);
  currentItems=computed(()=>this.diary()[this.selectedDate()]||[]);
  currentWater=computed(()=>this.waterByDate()[this.selectedDate()]||0);
  currentWorkouts=computed(()=>this.workoutsByDate()[this.selectedDate()]||[]);
  filteredFoods=computed(()=>{const q=this.query().trim().toLowerCase();return this.foods().filter(f=>(this.category()==='All'||f.category===this.category())&&(!q||`${f.name} ${f.nameEn||''} ${f.nameAr||''} ${f.brand||''}`.toLowerCase().includes(q)))});
  diaryDetails=computed(()=>this.currentItems().flatMap(item=>{const food=this.byId(item.foodId);return food?[{...item,food}]:[]}));
  totals=computed(()=>this.sum(this.diaryDetails()));
  historyRows=computed(()=>{const dates=Array.from(new Set([...Object.keys(this.diary()),...Object.keys(this.waterByDate()),...Object.keys(this.workoutsByDate())])).sort((a,b)=>b.localeCompare(a));return dates.map(date=>{const entries=this.diary()[date]||[];const foods=entries.flatMap(item=>{const food=this.byId(item.foodId);return food?[{food,grams:item.grams}]:[]});const sums=this.sum(foods);return{date,dateLabel:new Date(`${date}T12:00:00`).toLocaleDateString('en-US',{weekday:'short',month:'long',day:'numeric',year:'numeric'}),items:foods.length,kcal:sums.kcal,protein:sums.protein,carbs:sums.carbs,fat:sums.fat,water:this.waterByDate()[date]||0,workouts:this.workoutsByDate()[date]||[]}}).filter(day=>day.items>0||day.water>0||day.workouts.length>0)});
  calorieTarget=computed(()=>{const p=this.profile();if(!p)return 0;const bmr=10*p.weightKg+6.25*p.heightCm-5*p.age+(p.sex==='male'?5:-161);const factor:Record<Activity,number>={low:1.2,light:1.375,moderate:1.55,high:1.725};const maintenance=bmr*factor[p.activity];return Math.round((p.goal==='lose'?maintenance-300:p.goal==='gain'?maintenance+250:maintenance)/50)*50});
  remaining=computed(()=>Math.max(0,this.calorieTarget()-this.totals().kcal));
  planner=computed(()=>{const n=this.plannerMeals(),names:Meal[]=n===2?['Breakfast','Dinner']:n===4?['Breakfast','Lunch','Dinner','Snack']:['Breakfast','Lunch','Dinner'];const weights=n===2?[.45,.55]:n===4?[.25,.3,.35,.1]:[.3,.4,.3];const target=this.calorieTarget();return names.map((name,i)=>({name,kcal:Math.round(target*weights[i]),foods:this.planFoods(name,Math.max(0,target*weights[i]))}))});
  todayKey(){const now=new Date();return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`}
  constructor(){try{const raw=localStorage.getItem(STORAGE_KEY);if(raw){const s=JSON.parse(raw) as Partial<SavedData>;if(s.profile)this.profile.set(s.profile);if(Array.isArray(s.customFoods))this.customFoods.set(s.customFoods.map(food=>this.normalizeFood(food))); if(s.diary&&typeof s.diary==='object')this.diary.set(s.diary);if(s.water&&typeof s.water==='object')this.waterByDate.set(s.water);if(s.workouts&&typeof s.workouts==='object')this.workoutsByDate.set(Object.fromEntries(Object.entries(s.workouts).map(([date,rows])=>[date,(rows as any[]).map(row=>({id:row.id,exercise:row.exercise||row.type||'Activity',sets:Array.isArray(row.sets)?row.sets:[{reps:row.reps||row.minutes||10,weightKg:row.weightKg||0}]}))])));if(Number.isFinite(s.plannerMeals))this.plannerMeals.set(s.plannerMeals!)}else{const legacy=localStorage.getItem('nourish-tracker-v1');if(legacy){const old=JSON.parse(legacy) as {foods?:Food[];breakfast?:{foodId:string;grams:number}[];water?:number;plannerMeals?:number};const builtInIds=new Set(BUILT_INS.map(f=>f.id));this.customFoods.set((old.foods||[]).filter(f=>!builtInIds.has(f.id)).map(food=>this.normalizeFood(food)));this.diary.set({[this.todayKey()]:(old.breakfast||[]).map(i=>({...i,id:crypto.randomUUID(),meal:'Breakfast' as Meal}))});this.waterByDate.set({[this.todayKey()]:old.water||0});if(Number.isFinite(old.plannerMeals))this.plannerMeals.set(old.plannerMeals!);this.save()}}}catch{/* Start with a clean profile if storage is unavailable. */}}
  save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify({profile:this.profile(),customFoods:this.customFoods(),diary:this.diary(),water:this.waterByDate(),workouts:this.workoutsByDate(),plannerMeals:this.plannerMeals()} satisfies SavedData))}catch{/* The app remains usable if local storage is disabled. */}}
  normalizeFood(food:Food):Food{const{ kcal:legacyKcal,...current}=food;return{...current,caloriesPer100g:Number(food.caloriesPer100g??legacyKcal??0),nameEn:food.nameEn??food.name,sourceType:food.sourceType??'reference-estimate',sourceUrl:food.sourceUrl??null,isVerified:food.isVerified??false}}
  byId(id:string){return this.foods().find(f=>f.id===id)}
  calc(f:Food,g:number){return{kcal:f.caloriesPer100g*g/100,protein:f.protein===null?null:f.protein*g/100,carbs:f.carbs===null?null:f.carbs*g/100,fat:f.fat===null?null:f.fat*g/100}}
  sum(rows:{food:Food;grams:number}[]){const v=(k:'protein'|'carbs'|'fat')=>rows.some(x=>x.food[k]===null)?null:rows.reduce((s,x)=>s+(x.food[k]!*x.grams/100),0);return{kcal:rows.reduce((s,x)=>s+x.food.caloriesPer100g*x.grams/100,0),protein:v('protein'),carbs:v('carbs'),fat:v('fat')}}
  setProfile(){const p=this.profileForm;if(!p.name.trim()||p.age===null||p.age<18||p.age>100||p.heightCm===null||p.heightCm<120||p.heightCm>230||p.weightKg===null||p.weightKg<30||p.weightKg>350||!p.sex||!p.activity||!p.goal)return;this.profile.set({...p,age:p.age,heightCm:p.heightCm,weightKg:p.weightKg,sex:p.sex,activity:p.activity,goal:p.goal,name:p.name.trim()});this.editProfile.set(false);this.save()}
  openProfile(){const p=this.profile();if(p)this.profileForm={...p};this.editProfile.set(true)}
  setMeals(value:number){this.plannerMeals.set(value);this.save()}
  setServingCount(id:string,value:string){const row=this.diaryDetails().find(i=>i.id===id);if(!row)return;const grams=Math.max(0,Number(value)||0)*row.food.portionGrams;this.diary.update(d=>({...d,[this.selectedDate()]:this.currentItems().map(i=>i.id===id?{...i,grams}:i)}));this.save()}
  addToDiary(id:string){const food=this.byId(id);if(!food)return;const item:Item={id:crypto.randomUUID(),foodId:id,grams:food.portionGrams,meal:this.activeMeal()};this.diary.update(d=>({...d,[this.selectedDate()]:[...this.currentItems(),item]}));this.save()}
  removeFromDiary(id:string){this.diary.update(d=>({...d,[this.selectedDate()]:this.currentItems().filter(i=>i.id!==id)}));this.save()}
  itemsFor(meal:Meal){return this.diaryDetails().filter(i=>i.meal===meal)}
  mealKcal(meal:Meal){return this.sum(this.itemsFor(meal)).kcal}
  planFoods(meal:Meal,budget:number):PlannedFood[]{const recipes:Record<Meal,PlannedFood[]>={Breakfast:[{foodId:'toast',grams:80},{foodId:'cheddar',grams:20},{foodId:'turkey',grams:50},{foodId:'apple',grams:100}],Lunch:[{foodId:'chicken',grams:180},{foodId:'rice',grams:220},{foodId:'tomato',grams:100},{foodId:'oil',grams:10}],Dinner:[{foodId:'cottage',grams:150},{foodId:'rice',grams:180},{foodId:'tomato',grams:150},{foodId:'oil',grams:5}],Snack:[{foodId:'apple',grams:150},{foodId:'cottage',grams:100}]};const recipe=recipes[meal];const base=recipe.reduce((sum,row)=>sum+(this.byId(row.foodId)?.caloriesPer100g||0)*row.grams/100,0);const scale=base>0?budget/base:1;return recipe.map(x=>({...x,grams:Math.round(x.grams*scale/5)*5}))}
  addPlanToDiary(){const rows=this.planner().flatMap(meal=>meal.foods.map(food=>({id:crypto.randomUUID(),...food,meal:meal.name})));this.diary.update(d=>({...d,[this.selectedDate()]:[...this.currentItems(),...rows]}));this.save();this.tab.set('diary')}
  addWater(ml:number){if(!Number.isFinite(ml)||ml<=0)return;this.waterByDate.update(w=>({...w,[this.selectedDate()]:Math.min(10000,this.currentWater()+ml)}));this.waterInput=250;this.save()}
  addSet(){if(this.exerciseSets.length<30)this.exerciseSets=[...this.exerciseSets,{reps:10,weightKg:this.exerciseSets.at(-1)?.weightKg||0}]}
  removeSet(index:number){if(this.exerciseSets.length>1)this.exerciseSets=this.exerciseSets.filter((_,i)=>i!==index)}
  addWorkout(){const exercise=this.exerciseName.trim();if(!exercise)return;const sets=this.exerciseSets.map(set=>({reps:Math.max(1,Math.min(500,Number(set.reps)||1)),weightKg:Math.max(0,Math.min(1000,Number(set.weightKg)||0))}));const row:Workout={id:crypto.randomUUID(),exercise,sets};this.workoutsByDate.update(w=>({...w,[this.selectedDate()]:[...(w[this.selectedDate()]||[]),row]}));this.exerciseName='';this.exerciseSets=[{reps:10,weightKg:0}];this.save()}
  removeWorkout(id:string){this.workoutsByDate.update(w=>({...w,[this.selectedDate()]:this.currentWorkouts().filter(x=>x.id!==id)}));this.save()}
  addRecipeIngredient(){this.recipeIngredients=[...this.recipeIngredients,{foodId:'',grams:50}]}
  removeRecipeIngredient(index:number){if(this.recipeIngredients.length>1)this.recipeIngredients=this.recipeIngredients.filter((_,i)=>i!==index)}
  addFood(){
    const form=this.newFood;
    const name=form.name?.trim();
    if(!name)return;
    let caloriesPer100g=Number(form.caloriesPer100g);
    let protein=form.protein==null?null:Number(form.protein);
    let carbs=form.carbs==null?null:Number(form.carbs);
    let fat=form.fat==null?null:Number(form.fat);
    let ingredients:RecipeIngredient[]|undefined;
    let category=(form.category||'Other') as Category;
    let portionLabel='100 g';
    let preparationState='packaged';
    let sourceType:Food['sourceType']='food-label';
    let cookedWeightGrams:number|undefined;
    if(this.foodKind==='recipe'){
      const parts=this.recipeIngredients.filter(row=>row.foodId&&Number(row.grams)>0).map(row=>({foodId:row.foodId,grams:Number(row.grams)}));
      cookedWeightGrams=Number(this.recipeCookedWeight);
      if(!parts.length||!Number.isFinite(cookedWeightGrams)||cookedWeightGrams<=0)return;
      const totalCalories=parts.reduce((sum,row)=>sum+((this.byId(row.foodId)?.caloriesPer100g??0)*row.grams/100),0);
      caloriesPer100g=totalCalories/cookedWeightGrams*100;
      const macroPer100g=(key:'protein'|'carbs'|'fat')=>parts.some(row=>this.byId(row.foodId)?.[key]==null)?null:parts.reduce((sum,row)=>sum+(this.byId(row.foodId)?.[key]??0)*row.grams/100,0)/cookedWeightGrams!*100;
      protein=macroPer100g('protein');carbs=macroPer100g('carbs');fat=macroPer100g('fat');
      ingredients=parts;category='Homemade recipes';portionLabel='100 g cooked';preparationState='cooked';sourceType='homemade-recipe';
    }
    if(!Number.isFinite(caloriesPer100g)||caloriesPer100g<0)return;
    const food:Food={id:crypto.randomUUID(),name,nameEn:name,category,caloriesPer100g,protein,carbs,fat,portionGrams:100,portionLabel,brand:this.foodKind==='single'?form.brand?.trim():undefined,preparationState,sourceType,sourceUrl:null,isVerified:false,ingredients,cookedWeightGrams};
    this.customFoods.update(rows=>[food,...rows]);this.addToDiary(food.id);this.save();this.newFood={category:'Other',caloriesPer100g:0,name:''};this.foodKind='single';this.recipeIngredients=[{foodId:'',grams:100}];this.recipeCookedWeight=100;this.showFoodForm.set(false);
  }  openCalendar(input:HTMLInputElement){try{if(typeof input.showPicker==='function')input.showPicker();else{input.focus();input.click()}}catch{input.click()}}
  openHistoryDay(date:string){this.selectedDate.set(date);this.tab.set('diary')}
  setDate(value:string){if(value)this.selectedDate.set(value)}
  fmt(n:number){return n.toLocaleString('en-US',{maximumFractionDigits:1})}
  get dateLabel(){return new Date(`${this.selectedDate()}T12:00:00`).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}
  get shortDate(){return new Date(`${this.selectedDate()}T12:00:00`).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}
  get goalLabel(){return this.profile()?.goal==='lose'?'Weight loss':this.profile()?.goal==='gain'?'Weight gain':'Maintain weight'}
}















