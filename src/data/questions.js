// CELL QUEST question bank.
// Questions marked "PDF" come from the Cells & Organelles Game Question Bank;
// the rest are extra questions written for the game.
// Teacher note: review these against your course notes before publishing.
//
// Every question has a stable `id` — it is used for "Learn from mistakes",
// so change the text freely but avoid renaming ids.

// ---------- Multiple choice ----------
// answer = index of the correct choice (choices are shuffled in the game)
export const MCQ = [
  // PDF 1–30
  { id: 'mc1', q: 'Which structure controls most activities of a eukaryotic cell?', choices: ['Ribosome', 'Nucleus', 'Golgi apparatus', 'Lysosome'], answer: 1, explain: 'The nucleus contains most of the cell’s DNA and helps regulate cell activities.', topic: 'nucleus' },
  { id: 'mc2', q: 'Which organelle releases usable energy from food during cellular respiration?', choices: ['Mitochondrion', 'Chloroplast', 'Vacuole', 'Nucleolus'], answer: 0, explain: 'Mitochondria are major sites of aerobic cellular respiration and ATP production.', topic: 'mitochondrion' },
  { id: 'mc3', q: 'What is the main function of ribosomes?', choices: ['Store water', 'Make proteins', 'Digest worn-out organelles', 'Control entry and exit'], answer: 1, explain: 'Ribosomes assemble amino acids into proteins.', topic: 'ribosome' },
  { id: 'mc4', q: 'Which structure forms a selectively permeable boundary around the cell?', choices: ['Cell wall', 'Cytoplasm', 'Cell membrane', 'Chromosome'], answer: 2, explain: 'The cell membrane regulates what enters and leaves the cell.', topic: 'cellMembrane' },
  { id: 'mc5', q: 'Which organelle modifies, sorts, and packages many proteins for transport?', choices: ['Golgi apparatus', 'Nucleolus', 'Centriole', 'Chloroplast'], answer: 0, explain: 'The Golgi apparatus processes and packages proteins and lipids.', topic: 'golgi' },
  { id: 'mc6', q: 'Which organelle contains enzymes that help break down waste and worn-out cell parts?', choices: ['Lysosome', 'Ribosome', 'Chloroplast', 'Cell wall'], answer: 0, explain: 'Lysosomes contain digestive enzymes.', topic: 'lysosome' },
  { id: 'mc7', q: 'Which structure is found in plant cells and carries out photosynthesis?', choices: ['Lysosome', 'Chloroplast', 'Centriole', 'Nucleolus'], answer: 1, explain: 'Chloroplasts contain chlorophyll and capture light energy for photosynthesis.', topic: 'chloroplast' },
  { id: 'mc8', q: 'What is the jelly-like material in which many organelles are suspended?', choices: ['Cytoplasm', 'Cell wall', 'DNA', 'Chromatin'], answer: 0, explain: 'Cytoplasm includes the cytosol and the structures within the cell (excluding the nucleus in common classroom usage).', topic: 'cytoplasm' },
  { id: 'mc9', q: 'Which structure provides extra support and shape to plant cells?', choices: ['Cell membrane only', 'Cell wall', 'Ribosome', 'Golgi apparatus'], answer: 1, explain: 'The cellulose-rich cell wall helps support and protect plant cells.', topic: 'cellWall' },
  { id: 'mc10', q: 'What is the function of the large central vacuole in many plant cells?', choices: ['Make ribosomes', 'Store water and help maintain turgor pressure', 'Copy DNA', 'Produce all cell energy'], answer: 1, explain: 'The central vacuole stores water and solutes and supports the plant cell.', topic: 'vacuole' },
  { id: 'mc11', q: 'Which structure assembles ribosomal subunits inside the nucleus?', choices: ['Nucleolus', 'Mitochondrion', 'Smooth ER', 'Vesicle'], answer: 0, explain: 'The nucleolus makes rRNA and helps assemble ribosomal subunits.', topic: 'nucleolus' },
  { id: 'mc12', q: 'Which organelle is often involved in lipid synthesis and detoxification?', choices: ['Rough ER', 'Smooth ER', 'Lysosome', 'Chloroplast'], answer: 1, explain: 'Smooth ER synthesizes lipids and helps detoxify some substances.', topic: 'smoothER' },
  { id: 'mc13', q: 'Why does rough endoplasmic reticulum look “rough”?', choices: ['It has cellulose', 'It has ribosomes attached', 'It contains chlorophyll', 'It has a thick wall'], answer: 1, explain: 'Ribosomes attached to its surface give rough ER its appearance.', topic: 'roughER' },
  { id: 'mc14', q: 'Which statement about prokaryotic cells is correct?', choices: ['They always have a nucleus', 'They lack a membrane-bound nucleus', 'They all have chloroplasts', 'They have no DNA'], answer: 1, explain: 'Prokaryotes have DNA but do not enclose it in a membrane-bound nucleus.', topic: 'nucleus' },
  { id: 'mc15', q: 'Which pair is found in both typical plant and animal cells?', choices: ['Cell wall and chloroplast', 'Nucleus and mitochondria', 'Chloroplast and large central vacuole', 'Cell wall and large central vacuole'], answer: 1, explain: 'Both plant and animal eukaryotic cells typically contain a nucleus and mitochondria.', topic: 'mitochondrion' },
  { id: 'mc16', q: 'What is the main role of the cytoskeleton?', choices: ['Support, shape, and movement inside the cell', 'Store genetic code only', 'Make glucose from sunlight', 'Package proteins only'], answer: 0, explain: 'The cytoskeleton is a network of protein filaments that supports shape, transport, and movement.', topic: 'cytoskeleton' },
  { id: 'mc17', q: 'Which organelle is most directly involved in photosynthesis?', choices: ['Mitochondrion', 'Chloroplast', 'Lysosome', 'Golgi apparatus'], answer: 1, explain: 'Photosynthesis takes place in chloroplasts in plants and algae.', topic: 'chloroplast' },
  { id: 'mc18', q: 'Which molecule carries hereditary instructions in most cells?', choices: ['ATP', 'DNA', 'Starch', 'Cellulose'], answer: 1, explain: 'DNA stores genetic information.', topic: 'nucleus' },
  { id: 'mc19', q: 'What is a vesicle?', choices: ['A small membrane-bound sac used for transport or storage', 'A type of chromosome', 'A protein-making enzyme', 'The plant cell wall'], answer: 0, explain: 'Vesicles move or store materials inside cells and to/from the cell membrane.', topic: 'vesicle' },
  { id: 'mc20', q: 'Which organelle has its own DNA and is involved in energy conversion?', choices: ['Golgi apparatus', 'Mitochondrion', 'Lysosome', 'Smooth ER'], answer: 1, explain: 'Mitochondria contain their own DNA and help produce ATP.', topic: 'mitochondrion' },
  { id: 'mc21', q: 'Which feature is typical of animal cells but absent from most higher plant cells?', choices: ['Plasma membrane', 'Ribosomes', 'Centrioles', 'Mitochondria'], answer: 2, explain: 'Many animal cells have centrioles; most higher plant cells do not.', topic: 'centrosome' },
  { id: 'mc22', q: 'A cell that makes and exports lots of protein would likely have abundant…', choices: ['Rough ER and Golgi apparatus', 'Cell walls only', 'Chloroplasts only', 'Large lipid droplets only'], answer: 0, explain: 'Rough ER helps make proteins for secretion; the Golgi modifies and packages them.', topic: 'roughER' },
  { id: 'mc23', q: 'What happens to a typical animal cell placed in a very hypotonic solution?', choices: ['It may swell as water enters', 'It instantly makes a cell wall', 'It loses all DNA', 'It photosynthesizes'], answer: 0, explain: 'Water moves into the cell by osmosis; animal cells can swell and potentially burst.', topic: 'cellMembrane' },
  { id: 'mc24', q: 'What is osmosis?', choices: ['Movement of water across a selectively permeable membrane', 'Protein production', 'DNA copying', 'Cell division only'], answer: 0, explain: 'Osmosis is the net movement of water across a selectively permeable membrane.', topic: 'cellMembrane' },
  { id: 'mc25', q: 'Which structure helps organize microtubules during cell division in many animal cells?', choices: ['Centrosome', 'Chloroplast', 'Vacuole', 'Cell wall'], answer: 0, explain: 'The centrosome is a major microtubule-organizing center in animal cells.', topic: 'centrosome' },
  { id: 'mc26', q: 'Which organelle is the main site of aerobic respiration?', choices: ['Mitochondrion', 'Ribosome', 'Golgi apparatus', 'Nucleolus'], answer: 0, explain: 'Mitochondria generate much of the ATP in aerobic respiration.', topic: 'mitochondrion' },
  { id: 'mc27', q: 'What is the main difference between rough ER and smooth ER?', choices: ['Rough ER has ribosomes; smooth ER does not', 'Smooth ER has DNA; rough ER does not', 'Rough ER exists only in plants', 'Smooth ER is outside the cell'], answer: 0, explain: 'Ribosomes are attached to rough ER, while smooth ER lacks attached ribosomes.', topic: 'roughER' },
  { id: 'mc28', q: 'Which statement best describes an organelle?', choices: ['A specialized structure that performs a function in a cell', 'A whole organ in the body', 'A type of tissue only', 'A single atom'], answer: 0, explain: 'Organelles are specialized cell structures with particular roles.', topic: 'cytoplasm' },
  { id: 'mc29', q: 'Which organelle is most directly associated with sorting proteins into vesicles after processing?', choices: ['Golgi apparatus', 'Nucleolus', 'Cytoskeleton only', 'Cell wall'], answer: 0, explain: 'The Golgi apparatus sorts and packages many proteins into vesicles.', topic: 'golgi' },
  { id: 'mc30', q: 'Which cell structure is the primary location of DNA in a typical human cell?', choices: ['Nucleus', 'Cell membrane', 'Lysosome', 'Golgi apparatus'], answer: 0, explain: 'Most DNA in a human cell is in the nucleus; mitochondria also contain a small amount.', topic: 'nucleus' },
  // Extra
  { id: 'mc31', q: 'Which organelle is nicknamed “the powerhouse of the cell”?', choices: ['Nucleus', 'Mitochondrion', 'Ribosome', 'Vacuole'], answer: 1, explain: 'Mitochondria release most of the cell’s usable energy as ATP.', topic: 'mitochondrion' },
  { id: 'mc32', q: 'What is the plant cell wall mainly made of?', choices: ['Cellulose', 'Protein', 'Fat', 'DNA'], answer: 0, explain: 'Plant cell walls are built mainly from cellulose fibres.', topic: 'cellWall' },
  { id: 'mc33', q: 'Which structure is found in BOTH prokaryotic and eukaryotic cells?', choices: ['Nucleus', 'Ribosomes', 'Mitochondria', 'Golgi apparatus'], answer: 1, explain: 'All cells make proteins, so all cells have ribosomes.', topic: 'ribosome' },
  { id: 'mc34', q: 'A liver cell breaking down a drug would rely heavily on which organelle?', choices: ['Smooth ER', 'Chloroplast', 'Cell wall', 'Nucleolus'], answer: 0, explain: 'Smooth ER contains enzymes that detoxify drugs and poisons.', topic: 'smoothER' },
  { id: 'mc35', q: 'What is the fluid part of the cytoplasm called?', choices: ['Cytosol', 'Chromatin', 'Cell sap', 'Plasma'], answer: 0, explain: 'The cytosol is the fluid that the organelles float in.', topic: 'cytoplasm' },
  { id: 'mc36', q: 'Why does a plant cell in pure water NOT burst?', choices: ['Its cell wall resists the pressure', 'It has no membrane', 'It stops osmosis', 'Its nucleus pumps water out'], answer: 0, explain: 'The rigid cell wall pushes back, making the cell firm (turgid) instead of bursting.', topic: 'cellWall' },
  { id: 'mc37', q: 'The cell membrane is mainly made of…', choices: ['A phospholipid bilayer with proteins', 'Cellulose', 'Starch', 'Chlorophyll'], answer: 0, explain: 'Two layers of phospholipids, with proteins embedded, form the membrane.', topic: 'cellMembrane' },
  { id: 'mc38', q: 'A white blood cell swallows a bacterium. Which organelle digests it?', choices: ['Lysosome', 'Ribosome', 'Centrosome', 'Golgi apparatus'], answer: 0, explain: 'Lysosomes fuse with the food vacuole and their enzymes digest the bacterium.', topic: 'lysosome' },
];

// ---------- True / False ----------
export const TRUE_FALSE = [
  // PDF
  { id: 'tf1', q: 'All cells have a membrane.', answer: true, explain: 'Every cell, prokaryote or eukaryote, is surrounded by a cell membrane.' },
  { id: 'tf2', q: 'Plant cells do not have mitochondria.', answer: false, explain: 'Plant cells have both chloroplasts AND mitochondria.' },
  { id: 'tf3', q: 'Ribosomes help build proteins.', answer: true, explain: 'Ribosomes join amino acids into proteins.' },
  { id: 'tf4', q: 'Prokaryotic cells have a membrane-bound nucleus.', answer: false, explain: 'Prokaryotes keep their DNA in the cytoplasm, not in a nucleus.' },
  { id: 'tf5', q: 'The Golgi apparatus helps sort and package materials.', answer: true, explain: 'The Golgi is the cell’s post office.' },
  { id: 'tf6', q: 'The cell wall and cell membrane mean exactly the same thing.', answer: false, explain: 'The wall is a rigid outer layer in plants; the membrane is the thin selective boundary inside it.' },
  { id: 'tf7', q: 'Mitochondria contain a small amount of their own DNA.', answer: true, explain: 'Mitochondria have their own small circular DNA.' },
  { id: 'tf8', q: 'Chloroplasts are the main site of photosynthesis in plant cells.', answer: true, explain: 'Chlorophyll in chloroplasts captures light energy.' },
  { id: 'tf9', q: 'Osmosis is the movement of water across a selectively permeable membrane.', answer: true, explain: 'That is the definition of osmosis.' },
  { id: 'tf10', q: 'Every cell in the human body has a nucleus.', answer: false, explain: 'Mature red blood cells have no nucleus.' },
  // Extra
  { id: 'tf11', q: 'The nucleolus is found inside the nucleus.', answer: true, explain: 'The nucleolus is a dense region within the nucleus.' },
  { id: 'tf12', q: 'Animal cells have a cell wall.', answer: false, explain: 'Animal cells only have a cell membrane — no wall.' },
  { id: 'tf13', q: 'Ribosomes are only found on rough ER.', answer: false, explain: 'Many ribosomes float free in the cytoplasm too.' },
  { id: 'tf14', q: 'Chloroplasts contain chlorophyll.', answer: true, explain: 'Chlorophyll is the green pigment that absorbs light.' },
  { id: 'tf15', q: 'The Golgi apparatus makes DNA.', answer: false, explain: 'DNA is copied in the nucleus; the Golgi packages proteins and lipids.' },
  { id: 'tf16', q: 'Smooth ER has ribosomes on its surface.', answer: false, explain: 'No ribosomes — that is why it looks smooth.' },
  { id: 'tf17', q: 'Lysosomes contain digestive enzymes.', answer: true, explain: 'Their enzymes break down waste and worn-out parts.' },
  { id: 'tf18', q: 'The central vacuole helps keep a plant cell firm.', answer: true, explain: 'A full vacuole pushes against the wall, creating turgor pressure.' },
  { id: 'tf19', q: 'Prokaryotic cells contain DNA.', answer: true, explain: 'They have DNA — just not inside a nucleus.' },
  { id: 'tf20', q: 'The cytoskeleton is made of protein fibres.', answer: true, explain: 'Microtubules, microfilaments and intermediate filaments are all protein.' },
  { id: 'tf21', q: 'Cytoplasm is found outside the cell membrane.', answer: false, explain: 'Cytoplasm is inside the membrane.' },
  { id: 'tf22', q: 'Centrioles are usually found in animal cells.', answer: true, explain: 'Most animal cells have a centrosome with two centrioles.' },
  { id: 'tf23', q: 'Bacteria are prokaryotes.', answer: true, explain: 'Bacteria lack a nucleus and membrane-bound organelles.' },
  { id: 'tf24', q: 'Glycolysis takes place inside the mitochondrion.', answer: false, explain: 'Glycolysis happens in the cytosol; later stages happen in mitochondria.' },
  { id: 'tf25', q: 'Vesicles can carry proteins from the Golgi to the cell membrane.', answer: true, explain: 'Vesicles bud off the Golgi and fuse with the membrane.' },
];

// ---------- Riddles (answer = organelle id) ----------
export const RIDDLES = [
  // PDF
  { id: 'rd1', q: 'I am the cell’s instruction library, where most DNA is kept. What am I?', answer: 'nucleus', hint: 'I’m usually the biggest thing in an animal cell.' },
  { id: 'rd2', q: 'I am bean-shaped in many drawings and help cells make ATP. What am I?', answer: 'mitochondrion', hint: 'People call me the powerhouse.' },
  { id: 'rd3', q: 'I have ribosomes attached, so I look rough. I help make proteins for membranes or export. What am I?', answer: 'roughER', hint: 'My full name has “endoplasmic” in it.' },
  { id: 'rd4', q: 'I stack, sort, and ship proteins like a post office. What am I?', answer: 'golgi', hint: 'I’m named after an Italian scientist.' },
  { id: 'rd5', q: 'I contain chlorophyll and capture light energy. What am I?', answer: 'chloroplast', hint: 'I’m green and only in plants and algae.' },
  { id: 'rd6', q: 'I am a watery storage space that helps a plant cell stay firm. What am I?', answer: 'vacuole', hint: 'My name means “empty”.' },
  { id: 'rd7', q: 'I am a tiny protein-making machine found free in cytoplasm or attached to rough ER. What am I?', answer: 'ribosome', hint: 'I’m made of RNA and protein.' },
  { id: 'rd8', q: 'I am a selective gate that controls what enters and leaves. What am I?', answer: 'cellMembrane', hint: 'I’m a phospholipid bilayer.' },
  { id: 'rd9', q: 'I contain digestive enzymes and help recycle worn-out cell parts. What am I?', answer: 'lysosome', hint: 'My name means “breaking body”.' },
  { id: 'rd10', q: 'I am a supportive network of protein fibres that helps a cell keep its shape. What am I?', answer: 'cytoskeleton', hint: 'I’m the cell’s scaffold.' },
  // Extra
  { id: 'rd11', q: 'I’m a tiny bubble that carries cargo around the cell, like a delivery van. What am I?', answer: 'vesicle', hint: 'My name means “little bladder”.' },
  { id: 'rd12', q: 'I’m a little kernel inside the kernel, where ribosome parts are built. What am I?', answer: 'nucleolus', hint: 'I live inside the nucleus.' },
  { id: 'rd13', q: 'I’m a network with no ribosomes. I make lipids and clean up toxins. What am I?', answer: 'smoothER', hint: 'Liver cells have loads of me.' },
  { id: 'rd14', q: 'I’m the jelly that fills the cell and holds the organelles. What am I?', answer: 'cytoplasm', hint: '“Cyto” means cell.' },
  { id: 'rd15', q: 'I’m a rigid coat made of cellulose that plant cells wear. What am I?', answer: 'cellWall', hint: 'I sit outside the membrane.' },
  { id: 'rd16', q: 'I’m a pair of tiny cylinders that help organise the spindle when animal cells divide. What am I?', answer: 'centrosome', hint: 'I hold two centrioles.' },
];

// ---------- Word scrambles ----------
// organelle: shows that organelle's meaning, function and type as the clue.
// clue: used for words that are not an organelle.
export const SCRAMBLES = [
  // PDF (with the PDF's scrambled letters). Note: the PDF's scrambles for
  // MITOCHONDRION, MEMBRANE and CYTOSKELETON have wrong letters, so the game
  // scrambles those automatically instead.
  { id: 'sc1', word: 'NUCLEUS', organelle: 'nucleus', scrambled: 'SUEUNCL' },
  { id: 'sc2', word: 'MITOCHONDRION', organelle: 'mitochondrion', scrambled: 'HROMICTONNID' },
  { id: 'sc3', word: 'RIBOSOME', organelle: 'ribosome', scrambled: 'BOSIROME' },
  { id: 'sc4', word: 'GOLGI', organelle: 'golgi', scrambled: 'LIGGO' },
  { id: 'sc5', word: 'CHLOROPLAST', organelle: 'chloroplast', scrambled: 'RCHOLPSTALO' },
  { id: 'sc6', word: 'CYTOPLASM', organelle: 'cytoplasm', scrambled: 'CLOTYPAMS' },
  { id: 'sc7', word: 'LYSOSOME', organelle: 'lysosome', scrambled: 'YLSOSOME' },
  { id: 'sc8', word: 'MEMBRANE', organelle: 'cellMembrane', scrambled: 'CEMBRANE' },
  { id: 'sc9', word: 'VACUOLE', organelle: 'vacuole', scrambled: 'COVALUE' },
  { id: 'sc10', word: 'CYTOSKELETON', organelle: 'cytoskeleton', scrambled: 'TICSKYELTONO' },
  // Extra (scrambled automatically)
  { id: 'sc11', word: 'VESICLE', organelle: 'vesicle' },
  { id: 'sc12', word: 'NUCLEOLUS', organelle: 'nucleolus' },
  { id: 'sc13', word: 'CENTROSOME', organelle: 'centrosome' },
  { id: 'sc14', word: 'CELLULOSE', clue: { meaning: 'From "cell" + "-ose" (the ending used for sugars).', fn: 'The tough carbohydrate that plant cell walls are made of.', kind: 'Molecule (carbohydrate)' } },
  { id: 'sc15', word: 'CHLOROPHYLL', clue: { meaning: 'Greek "chloros" (green) + "phyllon" (leaf).', fn: 'Green pigment in chloroplasts that absorbs light energy.', kind: 'Molecule (pigment)' } },
  { id: 'sc16', word: 'OSMOSIS', clue: { meaning: 'Greek "osmos" — a push.', fn: 'Movement of water across a selectively permeable membrane.', kind: 'Process' } },
  { id: 'sc17', word: 'RETICULUM', clue: { meaning: 'Latin for "little net".', fn: 'The “R” in ER — a folded membrane network that makes proteins and lipids.', kind: 'Membrane network' } },
  { id: 'sc18', word: 'ENZYME', clue: { meaning: 'Greek "en" (in) + "zyme" (leaven / yeast).', fn: 'A protein that speeds up chemical reactions — lysosomes are full of digestive ones.', kind: 'Molecule (protein)' } },
  { id: 'sc19', word: 'PROKARYOTE', clue: { meaning: 'Greek "pro" (before) + "karyon" (kernel).', fn: 'A cell with no membrane-bound nucleus, such as a bacterium.', kind: 'Cell type' } },
  { id: 'sc20', word: 'ATP', clue: { meaning: 'Short for adenosine triphosphate.', fn: 'The energy currency molecule made mostly in mitochondria.', kind: 'Molecule' } },
];

// ---------- Fill in the blank ----------
export const FILL = [
  { id: 'fb1', q: 'The ____ is the control centre of the cell and holds most of its DNA.', choices: ['nucleus', 'vacuole', 'ribosome', 'cell wall'], answer: 0, explain: 'The nucleus stores DNA and controls cell activities.' },
  { id: 'fb2', q: '____ are the sites of protein synthesis.', choices: ['Ribosomes', 'Lysosomes', 'Vacuoles', 'Chloroplasts'], answer: 0, explain: 'Ribosomes build proteins.' },
  { id: 'fb3', q: 'Plant cells capture light energy in their ____.', choices: ['chloroplasts', 'mitochondria', 'nucleoli', 'vesicles'], answer: 0, explain: 'Chloroplasts carry out photosynthesis.' },
  { id: 'fb4', q: 'Water moves across a membrane by ____.', choices: ['osmosis', 'photosynthesis', 'respiration', 'digestion'], answer: 0, explain: 'Osmosis is the movement of water across a selectively permeable membrane.' },
  { id: 'fb5', q: 'The ____ packages proteins into vesicles.', choices: ['Golgi apparatus', 'nucleolus', 'cell wall', 'cytoskeleton'], answer: 0, explain: 'The Golgi modifies, sorts and packages proteins.' },
  { id: 'fb6', q: 'Most ATP is made in the ____.', choices: ['mitochondria', 'ribosomes', 'vacuole', 'Golgi'], answer: 0, explain: 'Aerobic respiration in mitochondria makes most ATP.' },
  { id: 'fb7', q: 'Rough ER looks rough because of attached ____.', choices: ['ribosomes', 'chloroplasts', 'lysosomes', 'cell walls'], answer: 0, explain: 'Ribosomes stud its surface.' },
  { id: 'fb8', q: 'Lysosomes contain digestive ____.', choices: ['enzymes', 'chlorophyll', 'DNA', 'cellulose'], answer: 0, explain: 'Their enzymes break down waste.' },
  { id: 'fb9', q: 'The plant cell wall is made mainly of ____.', choices: ['cellulose', 'protein', 'glucose', 'lipid'], answer: 0, explain: 'Cellulose fibres make the wall strong.' },
  { id: 'fb10', q: 'The cell membrane is ____ permeable.', choices: ['selectively', 'fully', 'never', 'only water'], answer: 0, explain: 'It lets some substances through more easily than others.' },
  { id: 'fb11', q: 'The large central ____ stores water in plant cells.', choices: ['vacuole', 'vesicle', 'nucleus', 'ribosome'], answer: 0, explain: 'The central vacuole holds water and keeps the cell firm.' },
  { id: 'fb12', q: 'The ____ is a network of protein fibres that gives the cell its shape.', choices: ['cytoskeleton', 'cytoplasm', 'cell wall', 'Golgi'], answer: 0, explain: 'The cytoskeleton is the cell’s scaffold.' },
  { id: 'fb13', q: 'Cells without a membrane-bound nucleus are called ____.', choices: ['prokaryotes', 'eukaryotes', 'organelles', 'tissues'], answer: 0, explain: 'Prokaryotes, like bacteria, have no nucleus.' },
  { id: 'fb14', q: 'The green pigment in chloroplasts is ____.', choices: ['chlorophyll', 'haemoglobin', 'melanin', 'keratin'], answer: 0, explain: 'Chlorophyll absorbs light energy.' },
  { id: 'fb15', q: 'The ____ ER makes lipids and helps detoxify the cell.', choices: ['smooth', 'rough', 'striped', 'green'], answer: 0, explain: 'Smooth ER has no ribosomes and makes lipids.' },
];

// ---------- Odd one out ----------
export const ODD_ONE_OUT = [
  { id: 'od1', choices: ['Nucleus', 'Mitochondrion', 'Chloroplast', 'Ribosome'], answer: 3, explain: 'Ribosomes have no membrane; the others are membrane-bound organelles.' },
  { id: 'od2', choices: ['Cell wall', 'Chloroplast', 'Central vacuole', 'Centriole'], answer: 3, explain: 'Centrioles are an animal-cell feature; the others are plant-cell features.' },
  { id: 'od3', choices: ['Mitochondrion', 'Chloroplast', 'Nucleus', 'Golgi apparatus'], answer: 3, explain: 'The Golgi has no DNA of its own; the other three contain DNA.' },
  { id: 'od4', choices: ['Ribosome', 'Rough ER', 'Golgi apparatus', 'Chloroplast'], answer: 3, explain: 'Ribosome → rough ER → Golgi is the protein export route. Chloroplasts do photosynthesis.' },
  { id: 'od5', choices: ['Osmosis', 'Diffusion', 'Active transport', 'Photosynthesis'], answer: 3, explain: 'The first three move substances across membranes; photosynthesis makes food.' },
  { id: 'od6', choices: ['Lysosome', 'Vesicle', 'Vacuole', 'Ribosome'], answer: 3, explain: 'Lysosomes, vesicles and vacuoles are membrane sacs; ribosomes are not.' },
  { id: 'od7', choices: ['Bacterium', 'Plant cell', 'Animal cell', 'Fungal cell'], answer: 0, explain: 'A bacterium is a prokaryote; the others are eukaryotic cells.' },
  { id: 'od8', choices: ['Nucleolus', 'Chromatin', 'Nuclear envelope', 'Cell wall'], answer: 3, explain: 'The first three are parts of the nucleus.' },
  { id: 'od9', choices: ['Microtubules', 'Microfilaments', 'Intermediate filaments', 'Phospholipids'], answer: 3, explain: 'The first three are cytoskeleton fibres; phospholipids make up the membrane.' },
  { id: 'od10', choices: ['Glucose', 'Oxygen', 'Carbon dioxide', 'Cellulose'], answer: 3, explain: 'Glucose, oxygen and CO₂ take part in respiration; cellulose is wall material.' },
];

// ---------- Plant, Animal or Both? ----------
export const SORT = [
  // PDF
  { id: 'pa1', q: 'Cell wall', answer: 'plant' },
  { id: 'pa2', q: 'Chloroplasts (in photosynthetic cells)', answer: 'plant' },
  { id: 'pa3', q: 'Large central vacuole', answer: 'plant' },
  { id: 'pa4', q: 'Cell membrane', answer: 'both' },
  { id: 'pa5', q: 'Mitochondria', answer: 'both' },
  { id: 'pa6', q: 'Ribosomes', answer: 'both' },
  { id: 'pa7', q: 'No cell wall', answer: 'animal' },
  { id: 'pa8', q: 'Lysosomes (as usually taught in intro biology)', answer: 'animal', explain: 'Introductory comparisons list lysosomes for animal cells; real cell types vary.' },
  // Extra
  { id: 'pa9', q: 'Nucleus', answer: 'both' },
  { id: 'pa10', q: 'Centrioles', answer: 'animal' },
  { id: 'pa11', q: 'Chlorophyll', answer: 'plant' },
  { id: 'pa12', q: 'Golgi apparatus', answer: 'both' },
  { id: 'pa13', q: 'Cytoplasm', answer: 'both' },
  { id: 'pa14', q: 'Starch grains for storage', answer: 'plant' },
  { id: 'pa15', q: 'Glycogen granules for storage', answer: 'animal' },
  { id: 'pa16', q: 'Endoplasmic reticulum', answer: 'both' },
  { id: 'pa17', q: 'Irregular, rounded shape', answer: 'animal' },
  { id: 'pa18', q: 'Fixed, box-like shape', answer: 'plant' },
];

// ---------- A-and-B two-part questions (self-marked) ----------
export const TWO_PART = [
  { id: 'ab1', a: 'Name the organelle that makes proteins.', b: 'Give one sentence describing how it does this.', ansA: 'Ribosome.', ansB: 'It joins amino acids in the order specified by genetic instructions (mRNA) to build a protein.' },
  { id: 'ab2', a: 'Name the organelle that produces most ATP during aerobic respiration.', b: 'Why do muscle cells often contain many of these organelles?', ansA: 'Mitochondrion.', ansB: 'Muscle cells need a lot of energy for contraction.' },
  { id: 'ab3', a: 'Identify two structures found in plant cells but not typical animal cells.', b: 'State one function of either structure.', ansA: 'Cell wall and chloroplast (a large central vacuole is also accepted).', ansB: 'The cell wall supports/protects the cell, OR chloroplasts carry out photosynthesis.' },
  { id: 'ab4', a: 'What is the cell membrane?', b: 'Explain what “selectively permeable” means.', ansA: 'A thin boundary (phospholipid bilayer) around the cell.', ansB: 'It allows some substances to cross more easily than others.' },
  { id: 'ab5', a: 'Name the organelle that modifies and packages proteins.', b: 'What might happen if it did not work properly?', ansA: 'Golgi apparatus.', ansB: 'Proteins might not be correctly modified, sorted, or delivered to their destinations.' },
  { id: 'ab6', a: 'Define cytoplasm.', b: 'Give one process that occurs in the cytoplasm.', ansA: 'The material inside the cell membrane — cytosol plus structures — around the organelles.', ansB: 'Glycolysis occurs in the cytosol (protein synthesis on free ribosomes is also accepted).' },
  { id: 'ab7', a: 'What is the nucleolus?', b: 'What cell structure does it help produce?', ansA: 'A dense region inside the nucleus.', ansB: 'Ribosomes — it makes rRNA and assembles ribosomal subunits.' },
  { id: 'ab8', a: 'Distinguish rough ER from smooth ER.', b: 'Name one function of smooth ER.', ansA: 'Rough ER has attached ribosomes; smooth ER does not.', ansB: 'Lipid synthesis, or detoxification of some substances.' },
  { id: 'ab9', a: 'What is a lysosome?', b: 'Why is it useful for a cell to break down worn-out parts?', ansA: 'A membrane-bound organelle containing digestive enzymes.', ansB: 'Materials can be recycled and damaged components are removed.' },
  { id: 'ab10', a: 'What is osmosis?', b: 'Predict what may happen to an animal cell in a very hypotonic solution.', ansA: 'Net movement of water across a selectively permeable membrane.', ansB: 'Water enters, so the cell swells and may burst.' },
  { id: 'ab11', a: 'What is the function of chlorophyll?', b: 'In which organelle is it found in plant cells?', ansA: 'It absorbs light energy for photosynthesis.', ansB: 'Chloroplast.' },
  { id: 'ab12', a: 'What is DNA?', b: 'Why is it important for cells?', ansA: 'Deoxyribonucleic acid — the molecule that carries genetic information.', ansB: 'It stores instructions used for cell function, growth, and reproduction.' },
  { id: 'ab13', a: 'Define organelle.', b: 'Give two examples and their functions.', ansA: 'A specialized structure in a cell that performs a function.', ansB: 'e.g. nucleus stores most DNA; mitochondrion produces much of the cell’s ATP.' },
  { id: 'ab14', a: 'What is a vesicle?', b: 'Give one job it can perform.', ansA: 'A small membrane-bound sac.', ansB: 'Transports materials within the cell or to/from the cell membrane.' },
  { id: 'ab15', a: 'State one similarity between plant and animal cells.', b: 'State one difference.', ansA: 'Both have a cell membrane, cytoplasm, nucleus and mitochondria.', ansB: 'Plant cells have a cell wall and chloroplasts (in photosynthetic tissue); animal cells do not.' },
];

// ---------- Build-a-Cell ----------
export const BUILDS = {
  animal: {
    needs: ['nucleus', 'cellMembrane', 'mitochondrion', 'ribosome', 'roughER', 'golgi', 'lysosome', 'centrosome'],
    wrong: ['cellWall', 'chloroplast', 'vacuole'],
  },
  plant: {
    needs: ['nucleus', 'cellMembrane', 'cellWall', 'chloroplast', 'vacuole', 'mitochondrion', 'ribosome', 'golgi'],
    // Lysosomes are left out on purpose: plant cells have lysosome-like
    // compartments, so marking them "wrong" would teach something false.
    wrong: ['centrosome'],
  },
};
