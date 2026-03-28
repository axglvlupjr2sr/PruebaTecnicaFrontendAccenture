import { TestBed } from '@angular/core/testing';
import { RemoteConfigService } from './remote-config.service';

/**
 * RemoteConfigService wraps Firebase RemoteConfig and must NOT call
 * Firebase in tests. The constructor catches the inject() error when
 * RemoteConfig is not provided, so we just DON'T provide it —
 * the service will set remoteConfig = null and work safely.
 */
describe('RemoteConfigService', () => {
  let service: RemoteConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // Intentionally NOT providing RemoteConfig — service catches the error
      providers: [RemoteConfigService],
    });
    service = TestBed.inject(RemoteConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default showPriorityBadges to true', () => {
    expect(service.showPriorityBadges()).toBeTrue();
  });

  it('should not crash when Firebase is unavailable', async () => {
    // init() with no remoteConfig should resolve without throwing
    await expectAsync(service.init()).toBeResolved();
  });

  it('should keep showPriorityBadges true when Firebase is unavailable', async () => {
    await service.init();
    expect(service.showPriorityBadges()).toBeTrue();
  });
});
