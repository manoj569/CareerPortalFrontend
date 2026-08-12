import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EmploymentType } from '@/features/jobs/types/jobModels';
import { createAppStore } from '@/store/store';
import { portfolioApi } from './portfolioApi';

interface MockApiRequest { data?: unknown; method?: string; url: string }
interface MockApiResponse { data: unknown; status?: number }
const { mockRequest } = vi.hoisted(() => ({
  mockRequest: vi.fn<(request: MockApiRequest) => Promise<MockApiResponse>>(),
}));
vi.mock('@/api/apiClient', () => ({ apiClient: { request: mockRequest } }));

const response = (data: unknown) => ({ data: { data } });
const record = { id: 'record-id', displayOrder: 0 };

describe('portfolio API contracts', () => {
  beforeEach(() => mockRequest.mockReset());

  it('uses relative lifecycle URLs and exact request bodies', async () => {
    const store = createAppStore();
    const editor = { isCreated: true, id: 'portfolio-id', slug: 'avery-patel', status: 'Draft' };
    const settings = { slug: 'avery-patel', template: 'Developer' as const, sections: [{ sectionType: 'About' as const, isVisible: true, displayOrder: 1 }] };
    mockRequest
      .mockResolvedValueOnce(response(editor))
      .mockResolvedValueOnce(response(editor))
      .mockResolvedValueOnce(response(editor))
      .mockResolvedValueOnce(response({ slug: 'avery-patel' }))
      .mockResolvedValueOnce(response({ published: false, missingRequirements: ['skills'], portfolio: editor }))
      .mockResolvedValueOnce(response(editor));
    const get = store.dispatch(portfolioApi.endpoints.getPortfolio.initiate()); await get.unwrap(); get.unsubscribe();
    await store.dispatch(portfolioApi.endpoints.createPortfolio.initiate({ requestedSlug: null, template: 'Professional' })).unwrap();
    await store.dispatch(portfolioApi.endpoints.updatePortfolioSettings.initiate(settings)).unwrap();
    const preview = store.dispatch(portfolioApi.endpoints.getPortfolioPreview.initiate()); await preview.unwrap(); preview.unsubscribe();
    await store.dispatch(portfolioApi.endpoints.publishPortfolio.initiate()).unwrap();
    await store.dispatch(portfolioApi.endpoints.unpublishPortfolio.initiate()).unwrap();
    expect(mockRequest.mock.calls.map(([request]) => request.url)).toEqual([
      '/candidate/portfolio', '/candidate/portfolio', '/candidate/portfolio/settings',
      '/candidate/portfolio/preview', '/candidate/portfolio/publish', '/candidate/portfolio/unpublish',
    ]);
    expect(mockRequest).toHaveBeenNthCalledWith(2, expect.objectContaining({ data: { requestedSlug: null, template: 'Professional' }, method: 'POST' }));
    expect(mockRequest).toHaveBeenNthCalledWith(3, expect.objectContaining({ data: settings, method: 'PUT' }));
  });

  it('maps every collection CRUD URL, stable ID, body, and 204 deletion', async () => {
    const store = createAppStore();
    const cases = [
      { collection:'experiences',data:{jobTitle:'Engineer',companyName:'Harbor',location:null,employmentType:EmploymentType.FullTime,startDate:'2025-01-01',endDate:null,isCurrent:true,description:null,displayOrder:0},run:async(data:Parameters<typeof portfolioApi.endpoints.addPortfolioExperience.initiate>[0])=>{await store.dispatch(portfolioApi.endpoints.addPortfolioExperience.initiate(data)).unwrap();await store.dispatch(portfolioApi.endpoints.updatePortfolioExperience.initiate({id:'record/id',data})).unwrap();await store.dispatch(portfolioApi.endpoints.deletePortfolioExperience.initiate('record/id')).unwrap();}},
      { collection:'education',data:{qualification:'B.Tech',institution:'College',fieldOfStudy:null,startYear:2020,endYear:2024,grade:null,description:null,displayOrder:0},run:async(data:Parameters<typeof portfolioApi.endpoints.addPortfolioEducation.initiate>[0])=>{await store.dispatch(portfolioApi.endpoints.addPortfolioEducation.initiate(data)).unwrap();await store.dispatch(portfolioApi.endpoints.updatePortfolioEducation.initiate({id:'record/id',data})).unwrap();await store.dispatch(portfolioApi.endpoints.deletePortfolioEducation.initiate('record/id')).unwrap();}},
      { collection:'projects',data:{name:'Portal',role:null,description:'Built it',technologies:['React'],sourceUrl:'https://github.com/example/repo',liveUrl:null,startDate:null,endDate:null,displayOrder:0},run:async(data:Parameters<typeof portfolioApi.endpoints.addPortfolioProject.initiate>[0])=>{await store.dispatch(portfolioApi.endpoints.addPortfolioProject.initiate(data)).unwrap();await store.dispatch(portfolioApi.endpoints.updatePortfolioProject.initiate({id:'record/id',data})).unwrap();await store.dispatch(portfolioApi.endpoints.deletePortfolioProject.initiate('record/id')).unwrap();}},
      { collection:'certifications',data:{name:'Cloud',issuer:null,issuedDate:null,expiryDate:null,doesNotExpire:true,credentialId:null,credentialUrl:null,displayOrder:0},run:async(data:Parameters<typeof portfolioApi.endpoints.addPortfolioCertification.initiate>[0])=>{await store.dispatch(portfolioApi.endpoints.addPortfolioCertification.initiate(data)).unwrap();await store.dispatch(portfolioApi.endpoints.updatePortfolioCertification.initiate({id:'record/id',data})).unwrap();await store.dispatch(portfolioApi.endpoints.deletePortfolioCertification.initiate('record/id')).unwrap();}},
      { collection:'links',data:{type:'GitHub' as const,label:null,url:'https://github.com/example',displayOrder:0},run:async(data:Parameters<typeof portfolioApi.endpoints.addPortfolioLink.initiate>[0])=>{await store.dispatch(portfolioApi.endpoints.addPortfolioLink.initiate(data)).unwrap();await store.dispatch(portfolioApi.endpoints.updatePortfolioLink.initiate({id:'record/id',data})).unwrap();await store.dispatch(portfolioApi.endpoints.deletePortfolioLink.initiate('record/id')).unwrap();}},
      { collection:'custom-sections',data:{title:'Writing',displayOrder:0},run:async(data:Parameters<typeof portfolioApi.endpoints.addPortfolioCustomSection.initiate>[0])=>{await store.dispatch(portfolioApi.endpoints.addPortfolioCustomSection.initiate(data)).unwrap();await store.dispatch(portfolioApi.endpoints.updatePortfolioCustomSection.initiate({id:'record/id',data})).unwrap();await store.dispatch(portfolioApi.endpoints.deletePortfolioCustomSection.initiate('record/id')).unwrap();}},
    ];
    for (const testCase of cases) {
      const { collection, data } = testCase;
      mockRequest.mockResolvedValueOnce(response({ ...record, ...data })).mockResolvedValueOnce(response({ ...record, ...data })).mockResolvedValueOnce({ data: undefined, status: 204 });
      await testCase.run(data as never);
      const calls = mockRequest.mock.calls.slice(-3).map(([request]) => request);
      expect(calls).toEqual([
        expect.objectContaining({ method: 'POST', url: `/candidate/portfolio/${collection}`, data }),
        expect.objectContaining({ method: 'PUT', url: `/candidate/portfolio/${collection}/record%2Fid`, data }),
        expect.objectContaining({ method: 'DELETE', url: `/candidate/portfolio/${collection}/record%2Fid` }),
      ]);
    }
  });

  it('maps custom-item CRUD and the anonymous public endpoint', async () => {
    const store=createAppStore(); const data={title:'Talk',description:null,date:null,url:'https://example.com/talk',displayOrder:0};
    mockRequest.mockResolvedValueOnce(response({...record,...data})).mockResolvedValueOnce(response({...record,...data})).mockResolvedValueOnce({data:undefined,status:204}).mockResolvedValueOnce(response({slug:'avery-patel'}));
    await store.dispatch(portfolioApi.endpoints.addPortfolioCustomItem.initiate({sectionId:'section/id',data})).unwrap();
    await store.dispatch(portfolioApi.endpoints.updatePortfolioCustomItem.initiate({sectionId:'section/id',itemId:'item/id',data})).unwrap();
    await store.dispatch(portfolioApi.endpoints.deletePortfolioCustomItem.initiate({sectionId:'section/id',itemId:'item/id'})).unwrap();
    const publicQuery=store.dispatch(portfolioApi.endpoints.getPublicPortfolio.initiate('avery/patel'));await publicQuery.unwrap();publicQuery.unsubscribe();
    expect(mockRequest.mock.calls.map(([request])=>request.url)).toEqual([
      '/candidate/portfolio/custom-sections/section%2Fid/items',
      '/candidate/portfolio/custom-sections/section%2Fid/items/item%2Fid',
      '/candidate/portfolio/custom-sections/section%2Fid/items/item%2Fid',
      '/portfolios/avery%2Fpatel',
    ]);
  });
});
