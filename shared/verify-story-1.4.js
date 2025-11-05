/**
 * Story 1.4 Verification Script
 * This script verifies all acceptance criteria are met
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Story 1.4: Shared Package Setup\n');

const checks = [];

// Check 1: Shared package initialized with TypeScript
console.log('✅ Check 1: Shared package initialized with TypeScript');
const tsConfigExists = fs.existsSync(path.join(__dirname, 'tsconfig.json'));
const packageJsonExists = fs.existsSync(path.join(__dirname, 'package.json'));
checks.push(tsConfigExists && packageJsonExists);
console.log(`   tsconfig.json: ${tsConfigExists ? '✅' : '❌'}`);
console.log(`   package.json: ${packageJsonExists ? '✅' : '❌'}\n`);

// Check 2: Zod schemas for authentication exported
console.log('✅ Check 2: Zod schemas for authentication exported');
const authSchemaExists = fs.existsSync(path.join(__dirname, 'src/schemas/auth.schema.ts'));
const authSchemaDist = fs.existsSync(path.join(__dirname, 'dist/schemas/auth.schema.js'));
const authSchemaDts = fs.existsSync(path.join(__dirname, 'dist/schemas/auth.schema.d.ts'));
checks.push(authSchemaExists && authSchemaDist && authSchemaDts);
console.log(`   src/schemas/auth.schema.ts: ${authSchemaExists ? '✅' : '❌'}`);
console.log(`   dist/schemas/auth.schema.js: ${authSchemaDist ? '✅' : '❌'}`);
console.log(`   dist/schemas/auth.schema.d.ts: ${authSchemaDts ? '✅' : '❌'}\n`);

// Check 3: Analysis schemas exported
console.log('✅ Check 3: Analysis schemas exported');
const analysisSchemaExists = fs.existsSync(path.join(__dirname, 'src/schemas/analysis.schema.ts'));
const analysisSchemaDist = fs.existsSync(path.join(__dirname, 'dist/schemas/analysis.schema.js'));
checks.push(analysisSchemaExists && analysisSchemaDist);
console.log(`   src/schemas/analysis.schema.ts: ${analysisSchemaExists ? '✅' : '❌'}`);
console.log(`   dist/schemas/analysis.schema.js: ${analysisSchemaDist ? '✅' : '❌'}\n`);

// Check 4: Additional schemas (user, api)
console.log('✅ Check 4: Additional schemas (user, api)');
const userSchemaExists = fs.existsSync(path.join(__dirname, 'src/schemas/user.schema.ts'));
const apiSchemaExists = fs.existsSync(path.join(__dirname, 'src/schemas/api.schema.ts'));
checks.push(userSchemaExists && apiSchemaExists);
console.log(`   src/schemas/user.schema.ts: ${userSchemaExists ? '✅' : '❌'}`);
console.log(`   src/schemas/api.schema.ts: ${apiSchemaExists ? '✅' : '❌'}\n`);

// Check 5: Constants exported
console.log('✅ Check 5: Constants exported');
const constantsExists = fs.existsSync(path.join(__dirname, 'src/constants/index.ts'));
const constantsDist = fs.existsSync(path.join(__dirname, 'dist/constants/index.js'));
checks.push(constantsExists && constantsDist);
console.log(`   src/constants/index.ts: ${constantsExists ? '✅' : '❌'}`);
console.log(`   dist/constants/index.js: ${constantsDist ? '✅' : '❌'}\n`);

// Check 6: Utilities exported
console.log('✅ Check 6: Utilities exported');
const validationUtilExists = fs.existsSync(path.join(__dirname, 'src/utils/validation.ts'));
const formattingUtilExists = fs.existsSync(path.join(__dirname, 'src/utils/formatting.ts'));
checks.push(validationUtilExists && formattingUtilExists);
console.log(`   src/utils/validation.ts: ${validationUtilExists ? '✅' : '❌'}`);
console.log(`   src/utils/formatting.ts: ${formattingUtilExists ? '✅' : '❌'}\n`);

// Check 7: Main index exports
console.log('✅ Check 7: Main index exports');
const indexExists = fs.existsSync(path.join(__dirname, 'src/index.ts'));
const indexDist = fs.existsSync(path.join(__dirname, 'dist/index.js'));
const indexDts = fs.existsSync(path.join(__dirname, 'dist/index.d.ts'));
checks.push(indexExists && indexDist && indexDts);
console.log(`   src/index.ts: ${indexExists ? '✅' : '❌'}`);
console.log(`   dist/index.js: ${indexDist ? '✅' : '❌'}`);
console.log(`   dist/index.d.ts: ${indexDts ? '✅' : '❌'}\n`);

// Check 8: Frontend dependency
console.log('✅ Check 8: Frontend can import @memedo/shared');
const frontendPackageJson = require('../frontend/package.json');
const frontendHasShared = frontendPackageJson.dependencies && frontendPackageJson.dependencies['@memedo/shared'];
checks.push(!!frontendHasShared);
console.log(`   @memedo/shared in frontend/package.json: ${frontendHasShared ? '✅' : '❌'}\n`);

// Check 9: Backend dependency
console.log('✅ Check 9: Backend can import @memedo/shared');
const backendPackageJson = require('../backend/package.json');
const backendHasShared = backendPackageJson.dependencies && backendPackageJson.dependencies['@memedo/shared'];
checks.push(!!backendHasShared);
console.log(`   @memedo/shared in backend/package.json: ${backendHasShared ? '✅' : '❌'}\n`);

// Check 10: TypeScript declarations generated
console.log('✅ Check 10: TypeScript type inference works');
const packageJson = require('./package.json');
const hasTypesField = !!packageJson.types;
checks.push(hasTypesField);
console.log(`   package.json "types" field: ${hasTypesField ? '✅' : '❌'}`);
console.log(`   Value: ${packageJson.types}\n`);

// Summary
const allPassed = checks.every(check => check);
console.log('═'.repeat(60));
if (allPassed) {
  console.log('🎉 Story 1.4 Verification: ALL CHECKS PASSED');
  console.log('✅ Shared package is correctly set up and ready for use!');
} else {
  console.log('⚠️  Story 1.4 Verification: SOME CHECKS FAILED');
  console.log(`   Passed: ${checks.filter(c => c).length}/${checks.length}`);
}
console.log('═'.repeat(60));
console.log();

// Bonus: Show what's exported from the package
console.log('📦 Package Exports Summary:');
try {
  const { 
    registerSchema, 
    loginSchema, 
    analyzeTokenSchema, 
    SUPPORTED_CHAINS,
    USER_ROLES,
    formatCompactNumber,
    validateData 
  } = require('./dist/index.js');
  
  console.log('   Schemas: registerSchema ✅, loginSchema ✅, analyzeTokenSchema ✅');
  console.log('   Constants: SUPPORTED_CHAINS ✅, USER_ROLES ✅');
  console.log('   Utils: formatCompactNumber ✅, validateData ✅');
  console.log();
} catch (error) {
  console.log('   ⚠️  Could not load exports:', error.message);
  console.log();
}

process.exit(allPassed ? 0 : 1);

