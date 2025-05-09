/////////////////////////////////////////////////////////////////////////////////////////////
// Copyright 2025 Garmin International, Inc.
// Licensed under the Flexible and Interoperable Data Transfer (FIT) Protocol License; you
// may not use this file except in compliance with the Flexible and Interoperable Data
// Transfer (FIT) Protocol License.
/////////////////////////////////////////////////////////////////////////////////////////////
// ****WARNING****  This file is auto-generated!  Do NOT edit this file.
// Profile Version = 21.171.0Release
// Tag = production/release/21.171.0-0-g57fed75
/////////////////////////////////////////////////////////////////////////////////////////////

import Profile from "./profile.js";

const decodeMemoGlobs = (messages) => {
    if ((messages?.memoGlobMesgs?.length ?? 0) == 0) {
        return;
    }

    const memoGlobMesgs = messages.memoGlobMesgs;

    // Group memoGlob mesgs by mesgNum, parentIndex, and fieldNum
    const groupedMemoGlobs = Object.groupBy(memoGlobMesgs, ({ mesgNum, parentIndex, fieldNum }) => {
        return JSON.stringify({
            mesgNum,
            parentIndex,
            fieldNum
        });
    });

    Object.entries(groupedMemoGlobs).forEach(([key, memoGlobMesgs]) => {
        const { mesgNum, parentIndex, fieldNum } = JSON.parse(key);

        // Sort grouped memoGlob messages by part index
        memoGlobMesgs.sort((a, b) => a.partIndex - b.partIndex);

        const mesgProfile = Object.values(Profile.messages).find((mesgDefinition) => {
            return mesgDefinition.name == mesgNum || mesgDefinition.num == mesgNum
        });

        const targetMesg = messages[mesgProfile?.messagesKey ?? mesgNum]?.[parentIndex];
        if (targetMesg == null) {
            return;
        }

        const targetFieldKey = mesgProfile?.fields?.[fieldNum]?.name ?? fieldNum;

        const memoGlobBytes = memoGlobMesgs.reduce((accumluatedBytes, mesg) => {
            return accumluatedBytes.concat(mesg.data);
        }, []);

        targetMesg[targetFieldKey] = decodeMemoGlobBytesToUtf8(memoGlobBytes);
    });
}

const decodeMemoGlobBytesToUtf8 = (memoGlobBytes) => {
    let decoder = new TextDecoder('utf-8');
    let bytes = new Uint8Array(memoGlobBytes);

    return decoder.decode(bytes);
}

export default {
    decodeMemoGlobs,
    decodeMemoGlobBytesToUtf8
}