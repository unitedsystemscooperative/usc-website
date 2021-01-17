import { IBuildInfov2 } from 'models/builds';
import { useShipBuildMutations } from './useShipBuildMutations';
import { IBuildInfoInsert } from 'models/builds/buildInfoInsert';
import { QueryAllShipBuilds } from 'gql/queries/shipBuilds';
import { useContext } from 'react';
import { RealmAppContext } from 'providers';
import useSWR, { mutate } from 'swr';
import { gqlFetcher } from 'gql/fetcher';

export const useShipBuilds = () => {
  const addRelated = useAddRelatedBuild();
  const addVariant = useAddVariantBuild();
  const { shipBuilds, loading, error } = useAllShipBuilds();
  const { addBuild, replaceBuild } = useShipBuildMutations();
  return {
    loading,
    shipBuilds,
    error,
    addBuild,
    addRelated,
    addVariant,
    replaceBuild,
  };
};

export const useAllShipBuilds = () => {
  const realm = useContext(RealmAppContext);
  const { data, error } = useSWR('/api/shipBuilds', () =>
    gqlFetcher(QueryAllShipBuilds, undefined, realm)
  );
  const shipBuilds = data?.shipBuildsv2s ?? [];

  return { shipBuilds, loading: !error && !data, error };
};

const useAddRelatedBuild = () => {
  const { addBuild, updateRelated } = useShipBuildMutations();
  const addRelatedBuild = async (
    currentID: string,
    shipBuilds: IBuildInfov2[],
    buildtoInsert: IBuildInfoInsert
  ) => {
    const currentBuild = shipBuilds.find(
      (x) => ((x._id as unknown) as string) === currentID
    );
    if (currentBuild) {
      const relatedBuilds = currentBuild.related;

      const tempBuild = buildtoInsert;
      tempBuild.related = currentBuild.related;
      tempBuild.related = [...tempBuild.related, currentID];
      const addedBuild: IBuildInfov2 | undefined | null = (
        await addBuild(tempBuild)
      ).data;
      console.log(addedBuild);
      if (addedBuild) {
        const buildID = (addedBuild._id as unknown) as string;
        if (buildID) {
          await updateRelated(currentID, [...relatedBuilds, buildID]);
          for (const id of relatedBuilds) {
            const build = shipBuilds.find(
              (x) => ((x._id as unknown) as string) === id
            );
            if (build) {
              const newRelated = [...build.related, buildID];
              await updateRelated((build._id as unknown) as string, newRelated);
            }
          }
          mutate('/api/shipBuilds');
        }
      } else {
        throw new Error('Reference build and related builds not updated');
      }
    } else {
      throw new Error('Reference build cannot be found');
    }
  };
  return addRelatedBuild;
};

const useAddVariantBuild = () => {
  const { addBuild, updateVariants, updateRelated } = useShipBuildMutations();
  const addVariantBuild = async (
    parentID: string,
    shipBuilds: IBuildInfov2[],
    buildtoInsert: IBuildInfoInsert
  ) => {
    const parentBuild = shipBuilds.find(
      (x) => ((x._id as unknown) as string) === parentID
    );
    if (parentBuild) {
      const variantBuilds = parentBuild.variants;

      const tempBuild = buildtoInsert;
      tempBuild.isVariant = true;
      tempBuild.related = variantBuilds;
      const addedBuild: IBuildInfov2 | undefined | null = (
        await addBuild(tempBuild)
      ).data;
      if (addedBuild) {
        const buildID = (addedBuild._id as unknown) as string;
        if (buildID) {
          console.log(buildID);
          await updateVariants(parentID, [...variantBuilds, buildID]);

          for (const id of variantBuilds) {
            console.log(id);
            const build = shipBuilds.find(
              (x) => ((x._id as unknown) as string) === id
            );
            if (build) {
              const newRelated = [...build.related, buildID];
              await updateRelated((build._id as unknown) as string, newRelated);
            }
          }
          mutate('/api/shipBuilds');
        }
      } else {
        throw new Error('Parent and related builds were not updated');
      }
    } else {
      throw new Error('Parent cannot be found');
    }
  };
  return addVariantBuild;
};
