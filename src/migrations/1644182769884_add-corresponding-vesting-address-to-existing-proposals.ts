/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    
    const sql = `
        UPDATE proposals SET vesting_address = '0xf5A0B88Ccb23e2058d71F3C0e8539364B0c009a8' WHERE id = 'f512be20-d376-11eb-987d-410735a966ad';
        UPDATE proposals SET vesting_address = '0x78b311f4BE9969C41931aDA45d6eC53Bf54998Cf' WHERE id = 'f227a8a0-d9b7-11eb-9110-69b867ba991b';
        UPDATE proposals SET vesting_address = '0x68412BF5805F8D6c9536eaeD42054714Ac037F17' WHERE id = 'e66cc2e0-e013-11eb-a20f-d75df7f87ed8';
        UPDATE proposals SET vesting_address = '0x7edB39B39F1b60C51c7d2559a2686733cEFc8EC2' WHERE id = 'cc7009f0-e08c-11eb-a20f-d75df7f87ed8';
        UPDATE proposals SET vesting_address = '0xEb5c2325351C3B5eB0d6aeEb40D6165B88bDf793' WHERE id = '691c8e60-f3c8-11eb-ab97-bfa89f33c258';
        UPDATE proposals SET vesting_address = '0xa79f1945aCc6121232B41Aec8B5F256D2A14a4ef' WHERE id = 'b9bf0ba0-09a2-11ec-a4d1-8d5d2cba0825';
        UPDATE proposals SET vesting_address = '0x162047b5d8E6a6436323daD716438574755985eC' WHERE id = 'f9d7ab30-1e5f-11ec-ac84-77607720a240';
        UPDATE proposals SET vesting_address = '0xfF06369c25CCBea0d22E480B38F59e23e77D1F9C' WHERE id = '6e28fee0-206c-11ec-ac84-77607720a240';
        UPDATE proposals SET vesting_address = '0x87074d88a6C6F7763f158C617da2e7fc16FA7Ee0' WHERE id = '48b67630-2b78-11ec-ac84-77607720a240';
        UPDATE proposals SET vesting_address = '0x03855c4C6b9F631E4e148B3C9A675D4442c99D7a' WHERE id = '84c9c400-2dc7-11ec-ac84-77607720a240';
        UPDATE proposals SET vesting_address = '0xAb35Bc5092Fdaa8F10159fb7F312dB7B95bC0291' WHERE id = '13583670-2ed6-11ec-ac84-77607720a240';
        UPDATE proposals SET vesting_address = NULL                                         WHERE id = '7890f630-3ceb-11ec-be0c-afec86cba5e5';
        UPDATE proposals SET vesting_address = '0xbcb3011858E7bE7041CF3c0aD86aE17FA7DcA693' WHERE id = '97eeea20-40b8-11ec-be0c-afec86cba5e5';
        UPDATE proposals SET vesting_address = '0x0eE7A7219017693C585C0D3801d1DA977D36C54b' WHERE id = '47e1bb80-4139-11ec-be0c-afec86cba5e5';
        UPDATE proposals SET vesting_address = '0x6F9462AcbC65E5660B56197b59c9970E283a37cb' WHERE id = '3511f910-4167-11ec-be0c-afec86cba5e5';
        UPDATE proposals SET vesting_address = '0x5C4096171623501067964817163ABA408d350675' WHERE id = 'b852d460-426c-11ec-be0c-afec86cba5e5';
        UPDATE proposals SET vesting_address = '0x3413AceAE5Ff27802dBddA2d882FE739B0104441' WHERE id = '0f9c21e0-43a8-11ec-be0c-afec86cba5e5';
        UPDATE proposals SET vesting_address = NULL                                         WHERE id = '7b6692e0-44d7-11ec-be0c-afec86cba5e5';
        UPDATE proposals SET vesting_address = '0xeFFf6Ef2F3c9778Ea811a345A3E0f0df2117F1C8' WHERE id = '1cf65440-4656-11ec-be0c-afec86cba5e5';
        UPDATE proposals SET vesting_address = '0xa30Dc75d9d0b0aD5131593ac8Cc493c2cd017510' WHERE id = 'f7459b10-46e2-11ec-be0c-afec86cba5e5';
        UPDATE proposals SET vesting_address = '0x2455aE25363fd9Cd62F007a7EdEDfc5F9b727364' WHERE id = '3842e400-4ca7-11ec-be0c-afec86cba5e5';
        UPDATE proposals SET vesting_address = NULL, status = 'rejected'                    WHERE id = '90f57aa0-5908-11ec-9c52-0d9746a59174';
        UPDATE proposals SET vesting_address = '0x9DE8991f006798cDf545Ba47b96aDAAe874fd648' WHERE id = '1dc31860-5955-11ec-9c52-0d9746a59174';
        UPDATE proposals SET vesting_address = NULL, status = 'rejected'                    WHERE id = 'a1aa6a50-5c72-11ec-9c52-0d9746a59174';
        UPDATE proposals SET vesting_address = NULL                                         WHERE id = '7af34c90-5d1e-11ec-8188-4352ce3d30e7';
        UPDATE proposals SET vesting_address = '0x0485fe82194e506796e4559944284b9930300809' WHERE id = '088fc210-5e26-11ec-8188-4352ce3d30e7';
        UPDATE proposals SET vesting_address = '0xf05c6a459b378f0bd033f7110288b7c767a74e7e' WHERE id = 'ed53e850-5e70-11ec-8188-4352ce3d30e7';
        UPDATE proposals SET vesting_address = '0xe8a1B5F25b3bF789aFAe04f3F11C0e7d0F527973' WHERE id = '6557be60-5f59-11ec-8188-4352ce3d30e7';
        UPDATE proposals SET vesting_address = '0xd82416d91b170888dd1973fdf519a914a0d0561c' WHERE id = '1ff25ce0-6247-11ec-8188-4352ce3d30e7';
        UPDATE proposals SET vesting_address = '0x8a6dec7bcc3af9a1d1b5507ccbfab6ecc434ac0a' WHERE id = '903b6e60-6409-11ec-8188-4352ce3d30e7';
        UPDATE proposals SET vesting_address = '0xe248dd3f57dcef23ae0dac68221791e4944adf82' WHERE id = '69fd4d60-6777-11ec-8188-4352ce3d30e7';
        UPDATE proposals SET vesting_address = '0x5ec155e5c34513d6a5fca1b09711219630cfcdd6' WHERE id = '92da0ce0-68d1-11ec-8188-4352ce3d30e7';
        UPDATE proposals SET vesting_address = '0x07b9fbb0b836f55dd4c19e79b1d673b3c83dcaaa' WHERE id = 'a37682b0-7798-11ec-8188-4352ce3d30e7';    
    `

    pgm.sql(sql);
    
}

export async function down(pgm: MigrationBuilder): Promise<void> {
}
